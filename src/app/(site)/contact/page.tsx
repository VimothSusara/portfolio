import type { Metadata } from "next";
import { ContactForm } from "@/components/site/contact-form";
import { FadeIn } from "@/components/motion/fade-in";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch for collaborations, freelance work, or opportunities.",
};

export default function ContactPage() {
  return (
    <section className="container mx-auto max-w-2xl px-4 py-16">
      <FadeIn>
        <h1 className="text-3xl font-bold tracking-tight">Contact</h1>
        <p className="mt-2 text-muted-foreground">
          Have a project in mind or want to connect? Send a message below.
        </p>
      </FadeIn>

      <FadeIn className="mt-10" delay={0.1}>
        <ContactForm />
      </FadeIn>
    </section>
  );
}