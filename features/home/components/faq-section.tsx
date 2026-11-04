import Link from "next/link";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SectionHeading } from "@/features/home/components/section-heading";

export const faqs = [
  {
    question: "What is a dynamic QR code?",
    answer:
      "A dynamic QR code points to a short link we manage. You can change where that link goes at any time, so the printed code never needs to be replaced.",
  },
  {
    question: "Do my QR codes stop working if I cancel?",
    answer:
      "Codes on the free plan keep working within its limits. If you downgrade, you choose which codes stay active.",
  },
  {
    question: "What analytics do you track?",
    answer:
      "Total and unique scans, scan time, approximate location (country and city), device type, operating system and browser. We never collect personal data from people who scan.",
  },
  {
    question: "Can I use my own branding?",
    answer:
      "Yes. On Pro and Team plans you can customize colors and module shapes, and place your logo in the center of every code.",
  },
  {
    question: "Can I collaborate with my team?",
    answer:
      "The Team plan includes organizations with member invitations and roles, so everyone works from the same library of codes.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-16 bg-brand-amber/10 py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.5fr]">
        <div className="space-y-6">
          <SectionHeading align="start" eyebrow="FAQ" title="Frequently asked questions" />
          <p className="text-muted-foreground">
            Can&apos;t find what you&apos;re looking for?{" "}
            <Link href="/contact" className="font-medium text-primary underline-offset-4 hover:underline">
              Get in touch
            </Link>
            .
          </p>
        </div>

        <Accordion className="border-t border-foreground/10">
          {faqs.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question} className="border-b border-foreground/10">
              <AccordionTrigger className="py-5 text-base hover:no-underline">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
