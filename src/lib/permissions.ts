// Role-based access. Safe to import from client components (used to hide nav links);
// enforcement always happens server-side in admin-guard.ts.

export const ROLES = ["owner", "admin", "editor"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = { owner: "Owner", admin: "Admin", editor: "Editor" };

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  owner: "Everything, including inviting and removing team members.",
  admin: "Waitlist, newsletter, traffic, journal, media, site images and the Home and Experiences pages. Can't manage the team.",
  editor: "Journal and media only.",
};

export type Permission = "waitlist" | "traffic" | "journal" | "media" | "site" | "team";

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  owner: ["waitlist", "traffic", "journal", "media", "site", "team"],
  admin: ["waitlist", "traffic", "journal", "media", "site"],
  editor: ["journal", "media"],
};

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/** Where to send someone who lands on a page their role can't see. */
export function homeFor(role: Role): string {
  return can(role, "waitlist") ? "/admin" : "/admin/journal";
}

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}
