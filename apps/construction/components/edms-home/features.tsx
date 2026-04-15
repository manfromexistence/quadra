import { Bell, FileStack, FolderKanban, Search, Send, Shield, Workflow } from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    title: "Document Control",
    description:
      "Complete version control, metadata management, and document numbering for all project files.",
    icon: <FileStack className="size-6" />,
  },
  {
    title: "Workflow Management",
    description:
      "Multi-level review and approval processes with automated routing and notifications.",
    icon: <Workflow className="size-6" />,
  },
  {
    title: "Transmittal System",
    description:
      "Formal document transmission tracking with acknowledgement and delivery confirmation.",
    icon: <Send className="size-6" />,
  },
  {
    title: "Project Management",
    description:
      "Organize documents by project with role-based access control and team collaboration.",
    icon: <FolderKanban className="size-6" />,
  },
  {
    title: "Real-time Notifications",
    description:
      "Stay updated with in-app and email notifications for document changes and workflow actions.",
    icon: <Bell className="size-6" />,
  },
  {
    title: "Advanced Search",
    description:
      "Quickly find documents with powerful filters by discipline, status, revision, and more.",
    icon: <Search className="size-6" />,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function Features() {
  return (
    <section id="features" className="relative isolate w-full py-20 md:py-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(from_var(--primary)_r_g_b_/_0.03),transparent_70%)]"></div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-center space-y-4"
          >
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl text-left">
              Everything You Need <br className="hidden lg:block" />
              <span className="text-muted-foreground">For Document Control</span>
            </h2>
            <p className="text-muted-foreground max-w-[400px] text-lg">
              Complete EDMS solution for construction projects with powerful workflow and
              collaboration tools.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid gap-6 sm:grid-cols-2"
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={item}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="group h-full rounded-2xl border border-border/40 bg-card/50 p-6 transition-all hover:bg-card hover:shadow-lg">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    {feature.icon}
                  </div>
                  <h3 className="mb-2 flex items-center gap-2 text-xl font-bold">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
