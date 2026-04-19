"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const testimonials = [
  {
    name: "Ahmed Hassan",
    title: "Project Manager • Dubai",
    content:
      "Quadra EDMS has streamlined our document control process. We're now saving 3-4 hours per week on transmittal management, and our team has complete visibility of all project documents.",
    highlighted:
      "We're now saving 3-4 hours per week on transmittal management",
    firstPart:
      "Quadra EDMS has streamlined our document control process. We're now saving 3-4 hours per week on transmittal management",
    secondPart:
      ", and our team has complete visibility of all project documents.",
  },
  {
    name: "Sarah Chen",
    title: "Construction Director • Singapore",
    content:
      "Without Quadra EDMS we would've lost critical project documents and faced major delays. I never had time to organize drawings and RFIs properly, so had no idea what was approved without calling the consultant.",
    highlighted:
      "Without Quadra EDMS we would've lost critical project documents and faced major delays",
    firstPart:
      "Without Quadra EDMS we would've lost critical project documents and faced major delays",
    secondPart:
      ". I never had time to organize drawings and RFIs properly, so had no idea what was approved without calling the consultant.",
  },
  {
    name: "Rajesh Kumar",
    title: "Site Engineer • India",
    content:
      "It has completely transformed how we manage construction documents. From tracking submittals to managing workflows and having all drawings centralized in one place, the change has been remarkable.",
    highlighted:
      "It has completely transformed how we manage construction documents",
    firstPart:
      "It has completely transformed how we manage construction documents",
    secondPart:
      ". From tracking submittals to managing workflows and having all drawings centralized in one place, the change has been remarkable.",
  },
  {
    name: "Michael Torres",
    title: "PMC Consultant • Philippines",
    content:
      "I prefer to have one tool for document management, similar to what Procore is for project management. Quadra EDMS helped us maintain ISO compliance: we're not using multiple clunky systems but an actually user-friendly tool that generates proper audit trails. That's a big win!",
    highlighted:
      "I prefer to have one tool for document management, similar to what Procore is for project management",
    firstPart:
      "I prefer to have one tool for document management, similar to what Procore is for project management",
    secondPart:
      ". Quadra EDMS helped us maintain ISO compliance: we're not using multiple clunky systems but an actually user-friendly tool that generates proper audit trails. That's a big win!",
  },
];

export default function LoginTestimonials() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    // Set random starting index only on client to avoid hydration mismatch
    setCurrentTestimonial(Math.floor(Math.random() * testimonials.length));

    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-64 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTestimonial}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center space-y-4"
        >
          {/* Quote - First */}
          <motion.div
            initial={{ opacity: 0, filter: "blur(2px)", y: 10 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="relative max-w-md mx-auto"
          >
            {/* Large opening quote */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-[0.02]">
              <svg
                width="220"
                height="220"
                viewBox="0 0 6 5"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-[220px] h-[220px] object-contain"
              >
                <path
                  d="M4.54533 4.828C4.16133 4.828 3.84333 4.684 3.59133 4.396C3.35133 4.108 3.23133 3.712 3.23133 3.208C3.23133 2.644 3.41133 2.104 3.77133 1.588C4.13133 1.072 4.68933 0.615999 5.44533 0.219999L5.76933 0.669999C5.12133 1.054 4.68933 1.438 4.47333 1.822C4.25733 2.206 4.14933 2.626 4.14933 3.082L3.68133 3.82C3.68133 3.52 3.77133 3.28 3.95133 3.1C4.14333 2.908 4.38333 2.812 4.67133 2.812C4.94733 2.812 5.18133 2.902 5.37333 3.082C5.56533 3.262 5.66133 3.502 5.66133 3.802C5.66133 4.09 5.55933 4.336 5.35533 4.54C5.15133 4.732 4.88133 4.828 4.54533 4.828ZM1.50333 4.828C1.11933 4.828 0.801328 4.684 0.549328 4.396C0.309328 4.108 0.189328 3.712 0.189328 3.208C0.189328 2.644 0.369328 2.104 0.729328 1.588C1.08933 1.072 1.64733 0.615999 2.40333 0.219999L2.72733 0.669999C2.07933 1.054 1.64733 1.438 1.43133 1.822C1.21533 2.206 1.10733 2.626 1.10733 3.082L0.639328 3.82C0.639328 3.52 0.729328 3.28 0.909328 3.1C1.10133 2.908 1.34133 2.812 1.62933 2.812C1.90533 2.812 2.13933 2.902 2.33133 3.082C2.52333 3.262 2.61933 3.502 2.61933 3.802C2.61933 4.09 2.51733 4.336 2.31333 4.54C2.10933 4.732 1.83933 4.828 1.50333 4.828Z"
                  fill="white"
                />
              </svg>
            </div>
            <p className="font-sans text-xl text-white/40 leading-relaxed pl-4">
              {(() => {
                const testimonial = testimonials[currentTestimonial];
                const secondPart = testimonial?.secondPart || "";
                const startsWithPunctuation =
                  secondPart.startsWith(".") || secondPart.startsWith(",");
                const punctuation = startsWithPunctuation ? secondPart[0] : ".";
                const secondPartWithoutPunctuation = startsWithPunctuation
                  ? secondPart.slice(1)
                  : secondPart;

                return currentTestimonial === 0 ? (
                  <>
                    {testimonial?.firstPart}
                    {punctuation}
                    <span className="text-white">
                      {secondPartWithoutPunctuation}"
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-white">
                      {testimonial?.firstPart}
                      {punctuation}
                    </span>
                    {secondPartWithoutPunctuation}"
                  </>
                );
              })()}
            </p>
          </motion.div>

          {/* Name and Title - Second */}
          <motion.p
            initial={{ opacity: 0, filter: "blur(2px)", y: 10 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="font-sans text-xs text-white/40"
          >
            {testimonials[currentTestimonial]?.name},{" "}
            {testimonials[currentTestimonial]?.title}
          </motion.p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
