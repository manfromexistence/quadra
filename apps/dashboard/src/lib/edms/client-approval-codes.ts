export const CLIENT_APPROVAL_OPTIONS = [
  {
    approvalCode: "Code-1",
    reviewStatus: "approved",
    label: "Code-1: Approved",
    shortLabel: "Approved",
    description: "Approved for release or shared for construction.",
  },
  {
    approvalCode: "Code-2",
    reviewStatus: "approved_with_comments",
    label: "Code-2: Approved with Comments",
    shortLabel: "Approved with Comments",
    description:
      "Client comments must be addressed through the revision cycle.",
  },
  {
    approvalCode: "Code-3",
    reviewStatus: "rejected",
    label: "Code-3: Rejected",
    shortLabel: "Rejected",
    description: "Revise and resubmit before the package can move forward.",
  },
  {
    approvalCode: "Code-4",
    reviewStatus: "for_information",
    label: "Code-4: For Information Only",
    shortLabel: "For Information Only",
    description: "Recorded as information only with no formal review required.",
  },
] as const;

export type ClientApprovalCode =
  (typeof CLIENT_APPROVAL_OPTIONS)[number]["approvalCode"];
export type ClientReviewStatus =
  (typeof CLIENT_APPROVAL_OPTIONS)[number]["reviewStatus"];

export function getClientApprovalOptionByCode(code: string | null | undefined) {
  const normalizedCode = normalizeClientApprovalCode(code);

  if (!normalizedCode) {
    return null;
  }

  return (
    CLIENT_APPROVAL_OPTIONS.find(
      (option) => option.approvalCode === normalizedCode,
    ) ?? null
  );
}

export function getClientApprovalOptionByStatus(
  status: string | null | undefined,
) {
  if (!status) {
    return null;
  }

  return (
    CLIENT_APPROVAL_OPTIONS.find((option) => option.reviewStatus === status) ??
    null
  );
}

export function getReviewStatusForApprovalCode(
  code: ClientApprovalCode,
): ClientReviewStatus {
  return (
    getClientApprovalOptionByCode(code)?.reviewStatus ??
    "approved_with_comments"
  );
}

export function normalizeClientApprovalCode(
  code: string | null | undefined,
): ClientApprovalCode | null {
  if (!code) {
    return null;
  }

  switch (code.trim().toLowerCase()) {
    case "1":
    case "code-1":
    case "code 1":
    case "approved":
      return "Code-1";

    case "2":
    case "code-2":
    case "code 2":
    case "approved_with_comments":
    case "approved with comments":
      return "Code-2";

    case "3":
    case "code-3":
    case "code 3":
    case "reject":
    case "rejected":
      return "Code-3";

    case "4":
    case "code-4":
    case "code 4":
    case "for_information":
    case "for information":
    case "for information only":
      return "Code-4";

    default:
      return null;
  }
}
