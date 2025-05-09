"use server";

import { getCurrentSession } from "@/lib/auth/auth";
import { getMyUserInfo } from "@/lib/auth/actions";
import SendForm from "./_components/form";

export default async function SendPage() {
  const token = await getCurrentSession();
  const user = await getMyUserInfo(token!);

  return (
    <div className="flex items-center justify-center mt-12 md:mt-20 pb-12">
      <SendForm userToken={token!} user={user} />
    </div>
  );
};