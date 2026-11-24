"use client";

import { createContext, use, useMemo, type ReactNode } from "react";

import type { PlanFeature, PlanFeatures } from "@/features/billing";
import { SYSTEM_ROLE_INFOS, type RoleInfo } from "@/features/organizations/libs/roles";
import { missingPermissions, type Permissions } from "@/lib/auth/permissions";

type AccessValue = {
  /** the viewer's stored role value, e.g. "admin" or "admin,field-team" */
  role: string;
  /** the viewer's combined grants */
  permissions: Permissions;
  /** every role the organization knows, system roles first */
  roles: RoleInfo[];
  /** feature flags of the plan in effect */
  features: PlanFeatures;
};

const AccessContext = createContext<AccessValue | null>(null);

/**
 * Hands the viewer's permissions to client components, so they can hide what the viewer can't
 * do. It only shapes the UI: every server action checks permissions again on its own.
 */
export function AccessProvider({ value, children }: { value: AccessValue; children: ReactNode }) {
  return <AccessContext value={value}>{children}</AccessContext>;
}

const NO_ACCESS: AccessValue = {
  role: "",
  permissions: {},
  roles: SYSTEM_ROLE_INFOS,
  features: { reports: false, auditLog: false, csvExport: false },
};

/**
 * The viewer's access and the organization's plan features; outside an organization nothing is
 * allowed and only system roles are known.
 */
export function useAccess() {
  const value = use(AccessContext) ?? NO_ACCESS;

  return useMemo(
    () => ({
      ...value,
      can: (permissions: Permissions) => missingPermissions(value.permissions, permissions).length === 0,
      has: (feature: PlanFeature) => value.features[feature],
    }),
    [value],
  );
}
