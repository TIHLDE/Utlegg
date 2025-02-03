"use server";

import { getCurrentSession } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import LoginForm from "./_components/form";


export default async function LoginPage() {
    const token = await getCurrentSession();
    // console.log("CHECKING TOKEN IN LOGIN: ", token);
    // if (token) redirect("/");

    return (
        <div className="max-w-3xl w-full mx-auto py-12">
            <LoginForm />
        </div>
    );
};