"use client";

import { motion, useMotionValue, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

// Testimonials Data
const testimonials = [
  {
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    name: "John Smith",
    tag: "PMC Director",
    description: `QUADRA has transformed how we manage project documents. The workflow system ensures nothing falls through the cracks, and our team loves the real-time notifications.`,
    href: "#",
  },
  {
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    name: "Sarah Johnson",
    tag: "Project Manager",
    description: `Finally, a document management system built specifically for construction. The transmittal tracking alone has saved us countless hours of follow-up emails.`,
    href: "#",
  },
  {
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    name: "Michael Chen",
    tag: "Client Representative",
    description: `The approval workflows are intuitive and the version control gives us complete confidence in document accuracy. Highly recommended for any construction project.`,
    href: "#",
  },
  {
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    name: "Emily Rodriguez",
    tag: "Document Controller",
    description: `Managing thousands of documents across multiple projects used to be overwhelming. QUADRA makes it simple with powerful search and filtering.`,
    href: "#",
  },
  {
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    name: "David Kumar",
    tag: "Vendor Manager",
    description: `The role-based access control ensures everyone sees exactly what they need. Document submission and review processes are now seamless.`,
    href: "#",
  },
  {
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
    name: "Lisa Thompson",
    tag: "Quality Manager",
    description: `Audit trails and activity logs give us complete transparency. We can track every document change and approval decision with ease.`,
    href: "#",
  },
  {
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert",
    name: "Robert Martinez",
    tag: "Subcontractor",
    description:
      "Submitting documents and tracking their status is now straightforward. The system is user-friendly and doesn't require extensive training.",
    href: "#",
  },
  {
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer",
    name: "Jennifer Lee",
    tag: "Construction Manager",
    description:
      "The dashboard gives us a clear overview of all project documents and pending actions. It's become essential to our daily operations.",
    href: "#",
  },
  {
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    name: "James Wilson",
    tag: "Engineering Lead",
    description: `Version control and document numbering are handled automatically. We can focus on engineering instead of administrative tasks.`,
    href: "#",
  },
  {
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    name: "Maria Garcia",
    tag: "Site Supervisor",
    description: `Access to the latest approved documents from anywhere has improved our site coordination significantly. Great mobile experience too.`,
    href: "#",
  },
];

const MarqueeRow = ({
  items,
  reverse = false,
}: {
  items: typeof testimonials;
  reverse?: boolean;
}) => {
  const shouldReduceMotion = useReducedMotion();
  const x = useRef(useMotionValue(0));
  const speed = shouldReduceMotion ? 0 : 20;
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrame = useRef(0);
  const lastTime = useRef(performance.now());
  const isPaused = useRef(false);
  const [duplicateCount, setDuplicateCount] = useState(2);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined" && containerRef.current) {
      const cardWidth = 400;
      const screenWidth = window.innerWidth;
      const cardsNeeded = Math.ceil(screenWidth / cardWidth) + 3;
      const loopCount = Math.ceil(cardsNeeded / items.length);
      setDuplicateCount(loopCount);

      const totalWidth = cardWidth * items.length * loopCount;
      setContainerWidth(totalWidth);
      x.current.set(reverse ? -totalWidth / 2 : 0);
    }
  }, [items.length, reverse]);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const animate = (time: number) => {
      const delta = time - lastTime.current;
      lastTime.current = time;

      if (!isPaused.current && containerRef.current) {
        const direction = reverse ? 1 : -1;
        const distance = (speed * delta * direction) / 1000;
        const currentX = x.current.get();

        let newX = currentX + distance;

        if (reverse && newX >= 0) {
          newX = -containerWidth / 2;
        } else if (!reverse && Math.abs(newX) >= containerWidth / 2) {
          newX = 0;
        }

        x.current.set(newX);
      }

      animationFrame.current = requestAnimationFrame(animate);
    };

    animationFrame.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame.current);
  }, [containerWidth, reverse, shouldReduceMotion, speed]);

  const pause = () => (isPaused.current = true);
  const resume = () => {
    lastTime.current = performance.now();
    isPaused.current = false;
  };

  const repeatedItems = Array(duplicateCount)
    .fill(null)
    .flatMap(() => items);

  return (
    <div
      className="relative w-full overflow-hidden py-2"
      style={{
        maskImage:
          "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
      }}
    >
      <motion.div
        ref={containerRef}
        style={{ x: x.current }}
        onMouseEnter={pause}
        onMouseLeave={resume}
        className={`flex w-max items-stretch gap-4 ${reverse ? "flex-row-reverse" : ""}`}
      >
        {repeatedItems.map((testimonial, i) => (
          <Card
            key={i}
            className="border-border/40 from-card to-card/50 hover:border-primary/20 group focus-within:ring-primary max-h-[240px] w-full max-w-[420px] min-w-[260px] overflow-hidden border bg-gradient-to-b backdrop-blur transition-all focus-within:ring-2 focus-within:ring-offset-2 hover:shadow-lg sm:max-w-[400px] sm:min-w-[300px]"
          >
            <Link
              href={testimonial.href}
              className="focus:ring-primary h-full rounded-lg focus:ring-2 focus:ring-offset-2 focus:outline-none"
              target="_blank"
              rel="noopener noreferrer"
            >
              <CardContent className="flex h-full w-[300px] flex-col gap-4 p-4 md:w-[400px]">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} loading="lazy" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                      {testimonial.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-foreground text-xl font-semibold">{testimonial.name}</h3>
                    <p className="text-muted-foreground text-sm">@{testimonial.tag}</p>
                  </div>
                </div>
                <p className="text-foreground line-clamp-4 overflow-hidden text-ellipsis whitespace-pre-wrap md:line-clamp-5">
                  {testimonial.description}
                </p>
              </CardContent>
            </Link>
          </Card>
        ))}
      </motion.div>
    </div>
  );
};

// Testimonials Main Section
export function Testimonials() {
  return (
    <section id="testimonials" className="relative isolate w-full py-20 md:py-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(from_var(--primary)_r_g_b_/_0.03),transparent_70%)]" />

      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 flex flex-col items-center justify-center space-y-4 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Trusted by <span className="text-primary font-serif italic">construction teams</span>
          </h2>
          <p className="text-muted-foreground max-w-[600px] text-lg md:text-xl">
            Join construction professionals managing their projects with confidence.
          </p>
        </motion.div>

        {/* 🚀 Two Marquee Rows */}
        <div className="flex flex-col gap-y-0">
          <MarqueeRow items={testimonials.slice(0, 5)} reverse={false} />
          <MarqueeRow items={testimonials.slice(5, 10)} reverse={true} />
        </div>
      </div>
    </section>
  );
}
