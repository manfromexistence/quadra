import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";

type SmokeResult = {
  step: string;
  ok: boolean;
  details: string;
};

const scriptDir = import.meta.dir;
const appRoot = resolve(scriptDir, "..");
const repoRoot = resolve(appRoot, "..", "..");
const envCandidates = [
  resolve(repoRoot, ".vercel", ".env.production.local"),
  resolve(repoRoot, ".env.local"),
  resolve(repoRoot, ".env"),
];

for (const candidate of envCandidates) {
  if (existsSync(candidate)) {
    loadEnv({ path: candidate, override: false });
  }
}

const baseURL = process.env.SMOKE_BASE_URL?.trim() || "http://127.0.0.1:3001";
const smokeEmail = process.env.SMOKE_AUTH_EMAIL?.trim() || "smoke-edms@quadra.example";
const smokePassword = process.env.SMOKE_AUTH_PASSWORD?.trim() || "QuadraSmoke123!";
const smokeName = process.env.SMOKE_AUTH_NAME?.trim() || "Quadra Smoke";

const pageRoutes = [
  "/en/projects",
  "/en/documents",
  "/en/workflows",
  "/en/transmittals",
  "/en/notifications",
] as const;

const results: SmokeResult[] = [];

async function main() {
  const authSession = await ensureAuthenticated();

  await checkSessionEndpoint(authSession.cookieHeader);
  await checkProtectedPages(authSession.cookieHeader);
  await checkUploadRoute(authSession.cookieHeader);

  const failures = results.filter((result) => !result.ok);

  for (const result of results) {
    console.log(`${result.ok ? "PASS" : "FAIL"} ${result.step}: ${result.details}`);
  }

  if (failures.length > 0) {
    process.exitCode = 1;
    return;
  }

  console.log(`Smoke test passed for ${baseURL}`);
}

async function ensureAuthenticated() {
  const signUpResult = await postAuthJson("/api/auth/sign-up/email", {
    email: smokeEmail,
    password: smokePassword,
    name: smokeName,
    role: "user",
    callbackURL: "/en/projects",
  });

  if (signUpResult.ok && signUpResult.body?.token && signUpResult.cookieHeader) {
    results.push({
      step: "auth.signUp",
      ok: true,
      details: `Created or refreshed smoke user ${smokeEmail}`,
    });

    return {
      email: smokeEmail,
      token: String(signUpResult.body.token),
      cookieHeader: signUpResult.cookieHeader,
    };
  }

  const signInResult = await postAuthJson("/api/auth/sign-in/email", {
    email: smokeEmail,
    password: smokePassword,
    callbackURL: "/en/projects",
  });

  if (signInResult.ok && signInResult.body?.token && signInResult.cookieHeader) {
    results.push({
      step: "auth.signIn",
      ok: true,
      details: `Signed in smoke user ${smokeEmail}`,
    });

    return {
      email: smokeEmail,
      token: String(signInResult.body.token),
      cookieHeader: signInResult.cookieHeader,
    };
  }

  const errorDetails = JSON.stringify({
    signUp: signUpResult.body,
    signIn: signInResult.body,
  });

  results.push({
    step: "auth.bootstrap",
    ok: false,
    details: errorDetails,
  });

  throw new Error(`Unable to authenticate smoke user. ${errorDetails}`);
}

async function checkSessionEndpoint(cookieHeader: string) {
  const response = await fetch(new URL("/api/auth/get-session", baseURL), {
    headers: {
      Cookie: cookieHeader,
    },
  });

  const body = await response.text();
  const ok = response.ok && body.includes(smokeEmail);

  results.push({
    step: "auth.session",
    ok,
    details: ok
      ? "Session endpoint returned the authenticated user."
      : `Unexpected response (${response.status}): ${body.slice(0, 200)}`,
  });
}

async function checkProtectedPages(cookieHeader: string) {
  for (const route of pageRoutes) {
    const response = await fetch(new URL(route, baseURL), {
      headers: {
        Cookie: cookieHeader,
      },
      redirect: "manual",
    });

    const body = await response.text();
    const redirectedToLogin =
      response.status >= 300 &&
      response.status < 400 &&
      response.headers.get("location")?.includes("/login");
    const hasServerError =
      body.includes("This page couldn’t load") || body.includes("Internal Server Error");
    const ok = response.status === 200 && !redirectedToLogin && !hasServerError;

    results.push({
      step: `page.${route}`,
      ok,
      details: ok
        ? `Loaded ${route} successfully.`
        : `Status ${response.status}, location=${response.headers.get("location") ?? "none"}, body=${body.slice(0, 120)}`,
    });
  }
}

async function checkUploadRoute(cookieHeader: string) {
  const textUpload = await uploadFixture(
    cookieHeader,
    new File([tinyPdf()], "smoke-check.pdf", { type: "application/pdf" })
  );

  const textProvider = textUpload.ok ? String(textUpload.body.provider ?? "unknown") : "failed";
  results.push({
    step: "upload.text",
    ok: textUpload.ok,
    details: textUpload.ok
      ? `Text upload succeeded via ${textProvider}.`
      : `Status ${textUpload.status}: ${JSON.stringify(textUpload.body).slice(0, 200)}`,
  });

  const imageUpload = await uploadFixture(
    cookieHeader,
    new File([tinyPng()], "smoke-image.png", { type: "image/png" })
  );

  const expectedImageProviders = process.env.IMGBB
    ? ["imgbb", "turso"]
    : ["imgbb", "catbox", "turso"];
  const imageProvider = String(imageUpload.body.provider ?? "unknown");
  const imageProviderOk = expectedImageProviders.includes(imageProvider);
  const imageOk = imageUpload.ok && imageProviderOk;

  results.push({
    step: "upload.image",
    ok: imageOk,
    details: imageOk
      ? `Image upload succeeded via ${imageProvider}.`
      : `Status ${imageUpload.status}: ${JSON.stringify(imageUpload.body).slice(0, 200)}`,
  });
}

async function uploadFixture(cookieHeader: string, file: File) {
  const formData = new FormData();
  formData.set("file", file);
  formData.set("projectId", "smoke-project");
  formData.set("folder", "workflow-attachments");

  const response = await fetch(new URL("/api/edms/uploads", baseURL), {
    method: "POST",
    headers: {
      Cookie: cookieHeader,
    },
    body: formData,
  });

  let body: Record<string, unknown> = {};

  try {
    body = (await response.json()) as Record<string, unknown>;
  } catch {
    body = { error: "Non-JSON response" };
  }

  return {
    ok: response.ok,
    status: response.status,
    body,
  };
}

async function postAuthJson(pathname: string, payload: Record<string, unknown>) {
  const response = await fetch(new URL(pathname, baseURL), {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  const cookieHeader = response.headers
    .getSetCookie()
    .map((entry) => entry.split(";")[0])
    .join("; ");

  return {
    ok: response.ok,
    status: response.status,
    body,
    cookieHeader: cookieHeader.length > 0 ? cookieHeader : null,
  };
}

function tinyPng() {
  return Uint8Array.from(
    Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9p3h2N8AAAAASUVORK5CYII=",
      "base64"
    )
  );
}

function tinyPdf() {
  return "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF";
}

await main();
