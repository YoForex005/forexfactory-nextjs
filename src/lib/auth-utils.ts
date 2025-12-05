import { Session } from "next-auth";

/**
 * Check if the user has admin panel access (admin or editor role)
 */
export function hasAdminAccess(session: Session | null): boolean {
    if (!session?.user?.role) return false;
    return ["admin", "editor"].includes(session.user.role);
}
