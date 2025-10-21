"use server";

import { getCurrentSession } from "@/lib/auth/auth";
import SendForm from "../_components/form";
import { getMyUserInfo } from "@/lib/auth/actions";

export default async function UtleggPage() {
  const token = await getCurrentSession();
  const user = await getMyUserInfo(token!);

  return (
    <div className="flex items-center justify-center mt-12 md:mt-20 pb-12">
      <SendForm userToken={token!} user={user} />
    </div>
  );
}
