"use server";

import { getCurrentSession } from "@/lib/auth/auth";
import SendForm from "../_components/form";

export default async function SendPage() {
  const token = await getCurrentSession();
  
  return (
    <div className="flex items-center justify-center mt-20 pb-12">
      <SendForm userToken={token!} />
    </div>
  );
};