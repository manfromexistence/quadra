import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Resend } from "resend";
import { db } from "@/db";
import * as schema from "@/db/schema";

const socialProviders = {
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      }
    : {}),
  ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
    ? {
        github: {
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
        },
      }
    : {}),
};

export const auth = betterAuth({
  appName: "QUADRA",
  baseURL:
    process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    async sendResetPassword({ user, url }) {
      const apiKey = process.env.RESEND_API_KEY ?? process.env.RESEND;

      if (!apiKey) {
        return;
      }

      const resend = new Resend(apiKey);
      const from = process.env.RESEND_FROM_EMAIL?.trim() || "QUADRA <onboarding@resend.dev>";

      await resend.emails.send({
        from,
        to: user.email,
        subject: "Reset your QUADRA password",
        html: [
          "<!doctype html>",
          '<html lang="en">',
          '<body style="margin:0;padding:32px;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a">',
          '<div style="margin:0 auto;max-width:640px;border-radius:24px;background:#ffffff;padding:32px;box-shadow:0 18px 50px rgba(15,23,42,0.08)">',
          '<p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#64748b">QUADRA</p>',
          '<h1 style="margin:0 0 16px;font-size:24px;line-height:1.3">Reset your password</h1>',
          `<p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#334155">Hello ${escapeHtml(user.name || user.email)},</p>`,
          '<p style="margin:0;font-size:14px;line-height:1.7;color:#334155">A password reset was requested for your QUADRA account. Use the button below to choose a new password.</p>',
          `<p style="margin:24px 0 0"><a href="${escapeHtml(url)}" style="display:inline-block;border-radius:9999px;background:#0f172a;color:#ffffff;padding:12px 18px;text-decoration:none;font-weight:600">Reset password</a></p>`,
          '<p style="margin:24px 0 0;font-size:12px;line-height:1.7;color:#94a3b8">If you did not request this, you can ignore this email.</p>',
          "</div>",
          "</body>",
          "</html>",
        ].join(""),
      });
    },
  },
  socialProviders,
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
      },
      organization: {
        type: "string",
        required: false,
      },
    },
  },
});

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
