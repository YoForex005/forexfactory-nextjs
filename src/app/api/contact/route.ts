import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.hostinger.com",
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const siteUrl = process.env.SITE_URL || "https://forexfactory.cc";
    const logoUrl = `${siteUrl}/favicon.png`;

    // 1. Email to Support (from user via authenticated SMTP sender)
    const supportMailOptions = {
      from: `"${name}" <${process.env.SMTP_USER}>`,
      replyTo: email,
      to: process.env.SMTP_USER,
      subject: `New Contact Form Submission: ${subject} - from Forex Factory`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #1a1a2e; border-radius: 10px; background-color: #f9f9f9;">
          <div style="text-align: center; margin-bottom: 20px; background-color: #0d0d1a; padding: 25px; border-radius: 10px 10px 0 0;">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
              <img src="${logoUrl}" alt="Forex Factory Logo" style="max-height: 40px; margin-right: 15px;" />
              <h1 style="color: #4facfe; margin: 0; font-size: 26px;">Forex Factory</h1>
            </div>
            <h2 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: normal;">New Contact Form Message</h2>
          </div>
          <div style="padding: 20px; background-color: white; border-radius: 5px; margin-bottom: 20px; border: 1px solid #eee;">
            <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #4facfe;">${email}</a></p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
          </div>
          <div style="padding: 20px; background-color: white; border-radius: 5px; border: 1px solid #eee;">
            <h3 style="color: #333; margin-top: 0; padding-bottom: 10px; border-bottom: 1px solid #eee;">Message</h3>
            <p style="white-space: pre-wrap; color: #444; line-height: 1.6;">${message}</p>
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <small style="color: #888;">This message was submitted via the contact form on Forex Factory.</small>
          </div>
        </div>
      `,
    };

    // 2. Automated Feedback Email to Sender
    const feedbackMailOptions = {
      from: `"Forex Factory Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Thank you for contacting us - Forex Factory",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #1a1a2e; border-radius: 10px; background-color: #0f0f1a; color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
              <img src="${logoUrl}" alt="Forex Factory Logo" style="max-height: 50px; margin-right: 15px;" />
              <h1 style="color: #4facfe; margin: 0; font-size: 32px;">Forex Factory</h1>
            </div>
          </div>
          <div style="background-color: #1a1a2e; padding: 30px; border-radius: 8px;">
            <h2 style="color: #ffffff; margin-top: 0; font-size: 20px;">Hi ${name},</h2>
            <p style="color: #e0e0e0; line-height: 1.6; font-size: 16px;">
              Thank you for contacting us! We have received your message and we will get back to you soon.
            </p>
            <p style="color: #e0e0e0; line-height: 1.6; font-size: 16px; margin-top: 20px;">
              <strong>Your Subject:</strong> ${subject}
            </p>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; text-align: center;">
            <p style="color: #888; font-size: 12px; line-height: 1.5;">
              This is an automated response. Please do not reply directly to this email unless you are providing additional information.
            </p>
            <p style="color: #888; font-size: 12px; margin-top: 10px;">
              Best regards,<br/><strong style="color: #aaa;">The Forex Factory Team</strong>
            </p>
            <p style="margin-top: 15px;">
              <a href="${siteUrl}" style="color: #4facfe; text-decoration: none; font-size: 13px;">Visit Forex Factory</a>
            </p>
          </div>
        </div>
      `,
    };

    // Send both emails in parallel
    await Promise.all([
      transporter.sendMail(supportMailOptions),
      transporter.sendMail(feedbackMailOptions)
    ]);

    return NextResponse.json(
      { success: true, message: "Message sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
