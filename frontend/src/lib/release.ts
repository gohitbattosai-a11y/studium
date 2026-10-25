import type { Role, SiteStatus } from "./types";

export const FEATURE_LABELS: Record<string, string> = {
  pets: "Pet e Box",
};

export const featureStage = (status: SiteStatus | undefined, feature: string) => status?.features[feature] ?? "all";

export const featureOpen = (status: SiteStatus | undefined, feature: string, role: Role) => {
  const stage = featureStage(status, feature);
  return stage === "all" || (stage === "admins" && role === "admin");
};

export const testingFeatures = (status: SiteStatus | undefined) =>
  Object.entries(status?.features ?? {})
    .filter(([, stage]) => stage === "admins")
    .map(([name]) => FEATURE_LABELS[name] ?? name);
