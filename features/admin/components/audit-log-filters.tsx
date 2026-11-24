"use client";

import { Select } from "@/components/shared/select/select";
import { ADMIN_AUDIT_ACTIONS, ADMIN_AUDIT_TARGET_TYPES } from "@/features/admin/libs/admin-audit-actions";

const TARGET_LABELS = {
  organization: "Organizations",
  subscription: "Subscriptions",
  plan: "Plans",
  user: "Users",
} as const satisfies Record<(typeof ADMIN_AUDIT_TARGET_TYPES)[number], string>;

// "organization.approve" → "Organization: approved the organization"
const actionOptions = Object.entries(ADMIN_AUDIT_ACTIONS).map(([value, phrase]) => {
  const group = value.split(".")[0];
  return { value, label: `${group[0].toUpperCase()}${group.slice(1)}: ${phrase}` };
});

const targetOptions = ADMIN_AUDIT_TARGET_TYPES.map((value) => ({ value, label: TARGET_LABELS[value] }));

/** Action, actor and target type, all in the URL; each change goes back to the first page. */
export function AdminAuditLogFilters({ actors }: { actors: { id: string; name: string }[] }) {
  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-center">
      <Select
        paramKey="action"
        data={actionOptions}
        placeholder="All actions"
        aria-label="Filter by action"
        clearable
        className="sm:w-72"
      />
      <Select
        paramKey="actor"
        data={actors.map((actor) => ({ value: actor.id, label: actor.name }))}
        placeholder="All admins"
        aria-label="Filter by admin"
        clearable
        className="sm:w-48"
      />
      <Select
        paramKey="target"
        data={targetOptions}
        placeholder="All targets"
        aria-label="Filter by target type"
        clearable
        className="sm:w-48"
      />
    </div>
  );
}
