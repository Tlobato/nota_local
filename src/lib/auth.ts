import { auth, currentUser } from "@clerk/nextjs/server";

export const ADMIN_EMAILS = [
  "thyagollobato@gmail.com",
  ...(process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase())
    : []),
];

export async function getAuthenticatedUser() {
  const session = await auth();
  const userId = session?.userId;
  if (!userId) {
    return { userId: null, userEmail: null, isSuperAdmin: false };
  }

  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase().trim() || null;
  const isSuperAdmin = Boolean(userEmail && ADMIN_EMAILS.includes(userEmail));

  return { userId, userEmail, isSuperAdmin };
}
