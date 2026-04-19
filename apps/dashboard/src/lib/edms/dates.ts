export function normalizeStoredDate(date: Date | null | undefined) {
  if (!date) {
    return null;
  }

  const time = date.getTime();
  if (!Number.isFinite(time)) {
    return null;
  }

  // Older seed rows were written in milliseconds while the current Drizzle
  // sqlite timestamp mapping expects seconds. Those rows deserialize into
  // far-future dates and need to be scaled back down for display and math.
  if (date.getUTCFullYear() > 2200) {
    return new Date(Math.trunc(time / 1000));
  }

  return date;
}

export function getStoredDateTime(date: Date | null | undefined) {
  return normalizeStoredDate(date)?.getTime() ?? 0;
}

export function formatStoredAbsoluteDate(date: Date | null | undefined) {
  const normalized = normalizeStoredDate(date);

  if (!normalized) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(normalized);
}

export function formatStoredTimestamp(date: Date | null | undefined) {
  const normalized = normalizeStoredDate(date);

  if (!normalized) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(normalized);
}
