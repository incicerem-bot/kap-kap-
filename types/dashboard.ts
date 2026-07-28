import type { AccountRole } from "@/lib/auth";

export type DashboardTone = "neutral" | "positive" | "warning" | "critical";

export type DashboardMetric = {
  key: string;
  label: string;
  value: string;
  helper: string;
  href: string;
  tone: DashboardTone;
};

export type DashboardTask = {
  key: string;
  title: string;
  description: string;
  href: string;
  complete: boolean;
  important?: boolean;
};

export type DashboardActivity = {
  id: string;
  title: string;
  description: string;
  href: string;
  createdAt: string;
  tone: DashboardTone;
};

export type DashboardWorkspaceItem = {
  id: string;
  title: string;
  description: string;
  meta: string;
  href: string;
  status: string;
  tone: DashboardTone;
};

export type AccountDashboard = {
  role: AccountRole;
  generatedAt: string;
  identity: {
    fullName: string;
    username: string | null;
    emailVerified: boolean;
    phoneVerified: boolean;
    profileCompleted: boolean;
    adminLevel: "none" | "operator" | "owner";
    sellerStatus: "not_started" | "pending" | "active" | "rejected" | "suspended";
    sellerReviewStatus: "not_submitted" | "pending" | "approved" | "rejected" | "suspended";
    sellerPayoutStatus: string | null;
    storeSlug: string | null;
  };
  metrics: DashboardMetric[];
  tasks: DashboardTask[];
  activity: DashboardActivity[];
  workspace: DashboardWorkspaceItem[];
};
