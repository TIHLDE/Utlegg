"use server";

import { z } from "zod";
import { SigninInputSchema } from "./schema";
import { deleteSessionTokenCookie, getCurrentSession, setSessionTokenCookie } from "./auth";
import { redirect } from "next/navigation";


export interface ActionResponse<T> {
    fieldError?: Partial<Record<keyof T, string | undefined>>;
    formError?: string;
}

export async function login(
    formData: FormData,
): Promise<ActionResponse<z.infer<typeof SigninInputSchema>>> {
    const obj = Object.fromEntries(formData.entries());
  
    const parsed = SigninInputSchema.safeParse(obj);
    if (!parsed.success) {
      const err = parsed.error.flatten();
      return {
        fieldError: {
          username: err.fieldErrors.username?.[0],
          password: err.fieldErrors.password?.[0],
        },
      };
    }
  
    const { username, password } = parsed.data;

    console.log("LOGIN: ", username, password);
  
    // Call Lepton API
    try {
        const response = await fetch("https://api.tihlde.org/auth/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: username, password }),
        });

        const data = await response.json();
        console.log(data)
        if (!response.ok) {
            throw new Error(data.detail);
        }

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
    
        // Set session cookie
        await setSessionTokenCookie(data.token, expiresAt);
        return {};
    } catch (e) {
        if (e instanceof Error) {
            return {
                formError: e.message,
            };
        }
        return {
            formError: "Det oppstod en feil under innlogging. Prøv igjen senere.",
        }
    };
};

export async function logout() {  
    await deleteSessionTokenCookie();
    return redirect("/login");
}

