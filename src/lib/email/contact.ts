import { Resend } from "resend";
import type { ContactFormValues } from "@/validations/contact";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function getFromEmail() {
  return process.env.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev";
}

function getToEmail(fallback?: string | null) {
  return process.env.CONTACT_TO_EMAIL ?? fallback ?? null;
}

export async function sendContactEmails(
  data: ContactFormValues,
  adminEmail?: string | null,
) {
  const resend = getResendClient();
  const toEmail = getToEmail(adminEmail);

  if (!resend || !toEmail) {
    console.warn("Email skipped: RESEND_API_KEY or CONTACT_TO_EMAIL not configured");
    return { sent: false as const };
  }

  const from = getFromEmail();
  const subjectLine = data.subject?.trim()
    ? data.subject.trim()
    : `New message from ${data.name}`;

  await resend.emails.send({
    from,
    to: toEmail,
    replyTo: data.email,
    subject: `[Portfolio] ${subjectLine}`,
    text: [
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      `Subject: ${data.subject?.trim() || "(none)"}`,
      "",
      data.message,
    ].join("\n"),
  });

  await resend.emails.send({
    from,
    to: data.email,
    subject: "Thanks for reaching out",
    text: [
      `Hi ${data.name},`,
      "",
      "Thanks for your message. I've received it and will get back to you soon.",
      "",
      "— Vimoth Susara",
    ].join("\n"),
  });

  return { sent: true as const };
}