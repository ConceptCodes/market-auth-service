import { Resend } from "resend";
import path from "path";
import fs from "fs";
import xss from "xss";

import { env } from "@lib/env";
import { createLogger } from "./logger";

const logger = createLogger("email client");
const resend = new Resend(env.RESEND_API_KEY);


export type VerifyEmailData = {
  code: string;
};

export type WelcomeEmailData = {
  name: string;
};

export type ResetPasswordEmailData = VerifyEmailData;

export type Data = WelcomeEmailData | VerifyEmailData | ResetPasswordEmailData;

type Email = {
  [key: string]: {
    subject: string;
    component: (data: Data) => string;
  };
};

const loadTemplate = (name: string, args: Record<string, string>): string => {
  const template = fs.readFileSync(
    path.join(__dirname, "..", "emails", `${name}.html`),
    "utf8"
  );
  return template.replace(/{{([^{}]*)}}/g, (a, b) => {
    const value = args[b];
    return typeof value === "string" ? value : a;
  });
};

const templates: Email = {
  welcome: {
    subject: "Welcome to Market",
    component: (data) => {
      return loadTemplate("welcome", data);
    },
  },
  verifyEmail: {
    subject: "Verify your email",
    component: (data) => {
      return loadTemplate("verify-email", data);
    },
  },
  resetPassword: {
    subject: "Reset your password",
    component: (data) => {
      return loadTemplate("reset-password", data);
    },
  },
};

export type Template = 'welcome' | 'verifyEmail' | 'resetPassword';

export async function sendEmail(email: string, template: Template, data: Data) {
  try {
    const subject = templates[template].subject;
    let html = templates[template].component(data);
    html = xss(html);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email address");
    }

    const res = await resend.emails.send({
      from: "Market <support@ekaaro.app>",
      to: [email],
      subject,
      html,
    });

    logger.info({ email, id: res.data?.id }, "Email sent successfully");
  } catch (error) {
    logger.error({ error }, "Error sending email");
    throw error;
  }
}

export async function checkEmailHealth() {
  try {
    const { data } = await resend.domains.list();
    return data !== null;
  } catch (error) {
    logger.error({ error }, "Error checking email health");
    return false;
  }
}
