import { Mail, MessageSquare } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { generateContactPageSchema } from "@/lib/seo";

const jsonLd = generateContactPageSchema();

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="flex-1 bg-surface-100">
        <section className="relative overflow-hidden bg-gradient-to-br from-brand/20 via-purple-500/20 to-surface-100 py-20">
          <div className="container mx-auto px-4 text-center md:text-left">
            <div className="mx-auto max-w-3xl md:mx-0">
              <h1 className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl">Get in Touch</h1>
              <p className="text-lg text-zinc-300 md:text-xl">Have questions about our Expert Advisors or need support? We&apos;re here to help!</p>
            </div>
          </div>
        </section>

        <section id="contact-form" className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid gap-12 lg:grid-cols-2">
              <ContactForm />

              <div className="space-y-8">
                <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-8 text-center md:items-start md:text-left">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 md:mx-0">
                    <Mail className="h-6 w-6 text-brand" />
                  </div>
                  <h2 className="mb-2 text-xl font-bold text-white">Email Us</h2>
                  <p className="mb-4 text-zinc-400">For general inquiries and support</p>
                  <a href="mailto:support@yoforex.net" className="text-brand hover:underline">support@yoforex.net</a>
                </div>

                <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-8 text-center md:items-start md:text-left">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 md:mx-0">
                    <MessageSquare className="h-6 w-6 text-purple-400" />
                  </div>
                  <h2 className="mb-2 text-xl font-bold text-white">Live Chat</h2>
                  <p className="mb-4 text-zinc-400">Get instant help from our support team</p>
                  <span className="text-brand">Live chat is coming soon</span>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center md:text-left">
                  <h2 className="mb-4 text-xl font-bold text-white">Frequently Asked Questions</h2>
                  <div className="space-y-4">
                    <div><h3 className="mb-1 font-medium text-white">Are all Expert Advisors really free?</h3><p className="text-sm text-zinc-400">Yes. All Expert Advisors are free to download and use.</p></div>
                    <div><h3 className="mb-1 font-medium text-white">Do I need coding knowledge?</h3><p className="text-sm text-zinc-400">No. Our EAs are ready to use on MT4 and MT5.</p></div>
                    <div><h3 className="mb-1 font-medium text-white">How often are EAs updated?</h3><p className="text-sm text-zinc-400">We continuously test and update our tools for the best experience.</p></div>
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
