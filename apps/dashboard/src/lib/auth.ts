import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Resend } from "resend";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { getServerAppUrl, getTrustedOrigins } from "@/utils/app-url";

export const auth = betterAuth({
  appName: "QUADRA",
  baseURL: getServerAppUrl(),
  trustedOrigins: getTrustedOrigins(),
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    async sendResetPassword({ user, url }) {
      const apiKey = process.env.RESEND_API_KEY ?? process.env.RESEND;

      if (!apiKey) {
        console.warn(
          "⚠️ RESEND_API_KEY not configured - password reset emails will not be sent",
        );
        return;
      }

      const resend = new Resend(apiKey);
      const from =
        process.env.RESEND_FROM_EMAIL?.trim() ||
        "QUADRA <onboarding@resend.dev>";

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
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  // NO OAuth providers - email/password only
  socialProviders: {},
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        input: true,
      },
      organization: {
        type: "string",
        required: false,
        input: true,
      },
      jobTitle: {
        type: "string",
        required: false,
        input: false,
      },
      phone: {
        type: "string",
        required: false,
        input: false,
      },
      department: {
        type: "string",
        required: false,
        input: false,
      },
      notificationPreferences: {
        type: "string",
        required: false,
        input: false,
      },
      isActive: {
        type: "boolean",
        defaultValue: true,
        input: false,
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

export type Session = typeof auth.$Infer.Session;
