import { Icons } from "@midday/ui/icons";
import { ChatPlatformPage } from "@/components/chat-platform-page";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Quadra for Telegram",
  description:
    "Run your business from Telegram. Send receipts, create invoices, track time, and get notifications — all from the messaging app you already use.",
  path: "/chat/telegram",
  og: {
    title: "Quadra for Telegram",
    description: "Your business, right in Telegram",
  },
  keywords: [
    "Telegram business",
    "Telegram invoicing",
    "Telegram receipts",
    "Telegram bookkeeping",
    "Quadra Telegram",
    "Telegram finance bot",
    "Telegram accounting",
  ],
});

const config = {
  name: "Telegram",
  slug: "telegram",
  appId: "telegram",
  icon: <Icons.Telegram size={40} className="h-10 w-10" />,
  description:
    "Connect Quadra to Telegram and manage your finances without leaving your conversations. Send a photo of a receipt, ask about your cash flow, create an invoice — Quadra handles it all through natural conversation.",
  steps: [
    {
      title: "Open Apps in Quadra",
      description:
        "Go to the Apps section in your Quadra dashboard and find Telegram.",
      href: "https://app-quadra.vercel.app/apps?app=telegram",
    },
    {
      title: "Connect Telegram",
      description:
        "Click the link to open a chat with the Quadra bot, then send the connection code to link your account.",
    },
    {
      title: "Start chatting",
      description:
        'Send your first message — try forwarding a receipt or asking "What did I spend this week?"',
    },
  ],
  notifications: [
    "New transactions from connected bank accounts",
    "Invoice status changes (paid, overdue)",
    "Receipt match suggestions",
    "Recurring invoice reminders",
  ],
  capabilities: [
    "Send receipts and PDFs — just snap a photo or forward a document",
    "Create and send invoices through conversation",
    "Track time by telling Quadra what you worked on",
    "Ask questions about your finances in plain language",
    "Get real-time notifications for transactions and invoices",
  ],
  settingsPath: "Apps \u2192 Telegram \u2192 Settings",
};

export default function Page() {
  return <ChatPlatformPage config={config} />;
}
