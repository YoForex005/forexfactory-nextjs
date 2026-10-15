import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

function getText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function getErrorCode(error: unknown) {
  return error instanceof Error && "code" in error && typeof error.code === "string"
    ? error.code
    : undefined;
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const fields = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    const name = getText(fields.name, 120);
    const email = getText(fields.email, 254).toLowerCase();
    const subject = getText(fields.subject, 200);
    const message = getText(fields.message, 10_000);

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Please complete every field." }, { status: 400 });
    }

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const smtpUser = process.env.SMTP_USER?.trim();
    const smtpPassword = process.env.SMTP_PASS;
    const smtpHost = process.env.SMTP_HOST?.trim() || "smtp.hostinger.com";
    const smtpPort = Number(process.env.SMTP_PORT) || 465;

    if (!smtpUser || !smtpPassword) {
      console.error("Contact email is not configured: SMTP_USER or SMTP_PASS is missing.");
      return NextResponse.json(
        { error: "Email service is not configured. Please email support directly." },
        { status: 503 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPassword },
      connectionTimeout: 15_000,
      greetingTimeout: 15_000,
      socketTimeout: 20_000,
    });

    const siteUrl = (process.env.SITE_URL || "https://forexfactory.cc").replace(/\/$/, "");
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);
    const recipient = process.env.CONTACT_RECIPIENT_EMAIL?.trim() || smtpUser;
    const logMetadata = JSON.stringify({
      type: "contact-form",
      name,
      email,
      subject,
      message,
    });

    // Preserve every contact enquiry in PostgreSQL before attempting SMTP delivery.
    // This is the reliable fallback when a mail provider is temporarily unavailable.
    const deliveryLog = await prisma.emailLog.create({
      data: {
        recipient,
        subject: `New contact form submission: ${subject}`,
        templateKey: "contact-form",
        status: "pending",
        metadata: logMetadata,
      },
    });

    // A message is only considered sent once the support mailbox has accepted it.
    let supportMessageId: string | undefined;
    try {
      const supportResult = await transporter.sendMail({
        from: `"ForexFactory Contact" <${smtpUser}>`,
        replyTo: { name, address: email },
        to: recipient,
        subject: `New contact form submission: ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;color:#172033">
            <h1 style="margin:0 0 20px;color:#147df5">New contact form message</h1>
            <p><strong>Name:</strong> ${safeName}</p>
            <p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
            <p><strong>Subject:</strong> ${safeSubject}</p>
            <hr style="border:0;border-top:1px solid #d9e1ec;margin:24px 0" />
            <p style="white-space:pre-wrap;line-height:1.6">${safeMessage}</p>
            <p style="color:#64748b;font-size:12px;margin-top:24px">Submitted from ${siteUrl}/contact</p>
          </div>
        `,
      });
      supportMessageId = supportResult.messageId;
      await prisma.emailLog.update({
        where: { id: deliveryLog.id },
        data: { status: "sent", messageId: supportMessageId, sentAt: new Date() },
      });
    } catch (deliveryError) {
      const code = getErrorCode(deliveryError);
      await prisma.emailLog.update({
        where: { id: deliveryLog.id },
        data: { status: "failed", error: code || "SMTP delivery failed" },
      }).catch((logError) => console.error("Contact delivery log update failed.", { code: getErrorCode(logError) }));

      console.error("Contact form SMTP delivery failed.", { code });
      return NextResponse.json({
        success: true,
        delivery: "saved",
        message: "Your message was received and saved for our support team. Email delivery is temporarily unavailable.",
      }, { status: 202 });
    }

    // A receipt is optional: an invalid visitor mailbox must not change a delivered
    // support message into a failed form submission.
    let acknowledgementSent = true;
    try {
      await transporter.sendMail({
        from: `"ForexFactory Support" <${smtpUser}>`,
        to: email,
        subject: "We received your message — ForexFactory",
        text: `Hi ${name},\n\nThanks for contacting ForexFactory. We have received your message and will reply as soon as possible.\n\nSubject: ${subject}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;color:#172033">
            <h1 style="margin:0 0 20px;color:#147df5">Thanks for contacting us</h1>
            <p>Hi ${safeName},</p>
            <p>We have received your message and will reply as soon as possible.</p>
            <p><strong>Your subject:</strong> ${safeSubject}</p>
            <p style="color:#64748b;font-size:12px;margin-top:24px">ForexFactory Support</p>
          </div>
        `,
      });
    } catch (acknowledgementError) {
      acknowledgementSent = false;
      const code = acknowledgementError instanceof Error && "code" in acknowledgementError
        ? acknowledgementError.code
        : undefined;
      console.warn("Contact acknowledgement could not be sent.", { code });
    }

    return NextResponse.json({
      success: true,
      delivery: "sent",
      message: "Message sent successfully.",
      messageId: supportMessageId,
      acknowledgementSent,
    });
  } catch (error) {
    const code = getErrorCode(error);
    console.error("Contact form delivery failed.", { code });

    return NextResponse.json(
      { error: "Email service is unavailable right now. Please try again shortly or email support directly." },
      { status: 502 }
    );
  }
}
