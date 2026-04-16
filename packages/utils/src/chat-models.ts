export const CHAT_MODEL_OPTIONS = [
  {
    id: "gpt-4.1-mini",
    label: "GPT-4.1 Mini",
    shortLabel: "4.1 Mini",
    description: "Balanced default",
  },
  {
    id: "gpt-4o-mini",
    label: "GPT-4o Mini",
    shortLabel: "4o Mini",
    description: "Fast responses",
  },
  {
    id: "gpt-4.1",
    label: "GPT-4.1",
    shortLabel: "4.1",
    description: "More capable",
  },
] as const;

export type ChatModelId = (typeof CHAT_MODEL_OPTIONS)[number]["id"];

export const DEFAULT_CHAT_MODEL: ChatModelId = "gpt-4.1-mini";

const CHAT_MODEL_ID_SET = new Set<string>(
  CHAT_MODEL_OPTIONS.map((option) => option.id),
);

export function isChatModelId(
  value: string | null | undefined,
): value is ChatModelId {
  return value != null && CHAT_MODEL_ID_SET.has(value);
}

export function coerceChatModelId(
  value: string | null | undefined,
): ChatModelId {
  return isChatModelId(value) ? value : DEFAULT_CHAT_MODEL;
}
