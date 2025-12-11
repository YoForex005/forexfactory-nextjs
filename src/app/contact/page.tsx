"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Mail, MessageSquare, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      setStatus("error");
      setErrorMessage("Failed to send message. Please try again.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-surface-100">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-brand/20 via-purple-500/20 to-surface-100 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="mb-6 text-5xl font-bold leading-tight text-white">
                Get in Touch
              </h1>
              <p className="text-xl text-zinc-300">
                Have questions about our Expert Advisors or need support? We're here to help!
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Contact Form */}
              <div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                  <h2 className="mb-6 text-2xl font-bold text-white">Send us a Message</h2>

                  {status === "success" ? (
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
                      <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-400" />
                      <h3 className="mb-2 text-xl font-bold text-white">Message Sent!</h3>
                      <p className="text-zinc-300">
                        Thank you for contacting us. We'll get back to you within 24 hours.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label htmlFor="name" className="mb-2 block text-sm font-medium text-zinc-300">
                          Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                          placeholder="Your name"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-300">
                          Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                          placeholder="your@email.com"
                        />
                      </div>

                      <div>
                        <label htmlFor="subject" className="mb-2 block text-sm font-medium text-zinc-300">
                          Subject *
                        </label>
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                          placeholder="How can we help?"
                        />
                      </div>

                      <div>
                        <label htmlFor="message" className="mb-2 block text-sm font-medium text-zinc-300">
                          Message *
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={6}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                          placeholder="Tell us more about your inquiry..."
                        />
                      </div>

                      {status === "error" && (
                        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
                          {errorMessage}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
                      >
                        {status === "loading" ? (
                          "Sending..."
                        ) : (
                          <>
                            <Send className="h-5 w-5" />
                            Send Message
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-8">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10">
                    <Mail className="h-6 w-6 text-brand" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-white">Email Us</h3>
                  <p className="mb-4 text-zinc-400">
                    For general inquiries and support
                  </p>
                  <a href="mailto:support@forexfactory.cc" className="text-brand hover:underline">
                    support@forexfactory.cc
                  </a>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                    <MessageSquare className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-white">Live Chat</h3>
                  <p className="mb-4 text-zinc-400">
                    Get instant help from our support team
                  </p>
                  <button className="text-brand hover:underline">
                    Start Chat (Coming Soon)
                  </button>
                </div>

                {/* FAQ */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                  <h3 className="mb-4 text-xl font-bold text-white">Frequently Asked Questions</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="mb-1 font-medium text-white">Are all Expert Advisors really free?</h4>
                      <p className="text-sm text-zinc-400">
                        Yes! All our Expert Advisors are 100% free to download and use.
                      </p>
                    </div>
                    <div>
                      <h4 className="mb-1 font-medium text-white">Do I need coding knowledge?</h4>
                      <p className="text-sm text-zinc-400">
                        No, our EAs are ready to use. Just download and install on MT4/MT5.
                      </p>
                    </div>
                    <div>
                      <h4 className="mb-1 font-medium text-white">How often are EAs updated?</h4>
                      <p className="text-sm text-zinc-400">
                        We continuously test and update our EAs to ensure optimal performance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
