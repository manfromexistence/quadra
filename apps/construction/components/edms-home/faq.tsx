import { motion } from "motion/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is QUADRA?",
    answer:
      "QUADRA is an Electronic Document Management System designed specifically for construction projects. It provides document control, workflow management, transmittal tracking, and team collaboration tools.",
  },
  {
    question: "Who can use QUADRA?",
    answer:
      "It's built for construction professionals including PMCs, clients, vendors, subcontractors, and project teams who need to manage documents and workflows efficiently.",
  },
  {
    question: "What features are included?",
    answer:
      "Core features include document version control, automated numbering, multi-level workflows, transmittal management, role-based access control, real-time notifications, and advanced search capabilities.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes! We use industry-standard security practices including encrypted connections, secure authentication, and role-based access control to protect your project data.",
  },
  {
    question: "Can I integrate with existing tools?",
    answer:
      "QUADRA is designed to work alongside your existing tools with file upload support and flexible workflow configurations.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="w-full py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-12 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-4"
          >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">FAQ</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Got questions? We&apos;ve got answers. If you can&apos;t find what you&apos;re looking
              for, feel free to reach out.
            </p>
            <div className="text-sm text-muted-foreground">
              <p>
                Contact us at{" "}
                <a href="mailto:support@construction-edms.com" className="text-primary underline">
                  support@construction-edms.com
                </a>
              </p>
            </div>
          </motion.div>

          <div className="lg:col-span-8">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <AccordionItem value={`item-${i}`} className="border rounded-lg px-4 bg-muted/20">
                    <AccordionTrigger className="hover:no-underline text-lg font-medium py-6">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-6 text-base">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
