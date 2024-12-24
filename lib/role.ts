export type ROLE = keyof typeof ROLES;

const ROLES = {
  admin: [
    "view:catalogue",
    "create:catalogue",
    "update:catalogue",
    "delete:catalogue",
    "invite:user",
    "remove:user",
  ],
  editor: ["view:catalogue", "create:catalogue", "update:catalogue"],
  viewer: ["view:catalogue"],
} as const;

export type Permission = (typeof ROLES)[keyof typeof ROLES][number];

export function hasPermission(
  role: ROLE | null | undefined,
  permission: Permission,
) {
  if (!role) return false;
  return ROLES[role].includes(permission);
}
