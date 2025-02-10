"use server";
  
import { cookies } from "next/headers";
import { SESSION_NAME } from "../constants";
  

export async function setSessionTokenCookie(
  token: string,
  expiresAt: Date,
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function deleteSessionTokenCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}

export const getUncachedCurrentSession =
  async (): Promise<string | null> => {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_NAME)?.value ?? null;
    return token;
};

export const getCurrentSession = getUncachedCurrentSession;