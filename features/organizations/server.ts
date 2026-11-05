import "server-only";

// Public, server-only API of the organizations feature. Import from "@/features/organizations/server" only.
export { OrganizationList, OrganizationListSkeleton } from "./components/organization-list";
export { getOrganizationBySlug, getSession, listOrganizations } from "./services/get-organization";
