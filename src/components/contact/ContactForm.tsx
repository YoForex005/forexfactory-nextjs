"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";

const INITIAL_FORM_DATA = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

type DeliveryStatus = "sent" | "saved" | null;

export function ContactForm() {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    setSuccessMessage("");
    setDeliveryStatus(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result: unknown = await response.json().catch(() => ({}));
      const payload = result && typeof result === "object" ? result as Record<string, unknown> : {};

      if (!response.ok) {
        throw new Error(
          typeof payload.error === "string" ? payload.error : "Failed to send message"
        );
      }

      setStatus("success");
      setSuccessMessage(
        typeof payload.message === "string" ? payload.message : "Message sent successfully."
      );
      setDeliveryStatus(payload.delivery === "saved" ? "saved" : "sent");
      setFormData(INITIAL_FORM_DATA);
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to send message. Please try again."
      );
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center md:text-left">
      <h2 className="mb-6 text-2xl font-bold text-white">Send us a Message</h2>

      {status === "success" ? (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-400" />
          <h3 className="mb-2 text-xl font-bold text-white">
            {deliveryStatus === "saved" ? "Message Received!" : "Message Sent!"}
          </h3>
          <p className="text-zinc-300">{successMessage || "Thank you for contacting us. We’ll get back to you within 24 hours."}</p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          toolname="send_support_message"
          tooldescription="Sends a support request to the ForexFactory team. Use when a visitor needs help with trading tools, downloads, signals, or their account."
        >
          <div>
            <label htmlFor="name" className="mb-2 block text-left text-sm font-medium text-zinc-300">Name *</label>
            <input type="text" id="name" name="name" toolparamdescription="The visitor's name." value={formData.name} onChange={handleChange} required maxLength={120} autoComplete="name" className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 md:text-left" placeholder="Your name" />
          </div>
          <div>
            <label htmlFor="email" className="mb-2 block text-left text-sm font-medium text-zinc-300">Email *</label>
            <input type="email" id="email" name="email" toolparamdescription="The email address where the visitor can receive a reply." value={formData.email} onChange={handleChange} required maxLength={254} autoComplete="email" className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 md:text-left" placeholder="your@email.com" />
          </div>
          <div>
            <label htmlFor="subject" className="mb-2 block text-left text-sm font-medium text-zinc-300">Subject *</label>
            <input type="text" id="subject" name="subject" toolparamdescription="A short summary of the support request." value={formData.subject} onChange={handleChange} required maxLength={200} className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 md:text-left" placeholder="How can we help?" />
          </div>
          <div>
            <label htmlFor="message" className="mb-2 block text-left text-sm font-medium text-zinc-300">Message *</label>
            <textarea id="message" name="message" toolparamdescription="The full support request, including relevant trading platform or download details." value={formData.message} onChange={handleChange} required maxLength={10000} rows={6} className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 md:text-left" placeholder="Tell us more about your inquiry..." />
          </div>
          {status === "error" && <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">{errorMessage}</div>}
          <button type="submit" disabled={status === "loading"} className="flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-50">
            {status === "loading" ? "Sending..." : <><Send className="h-5 w-5" />Send Message</>}
          </button>
        </form>
      )}
    </div>
  );
}
