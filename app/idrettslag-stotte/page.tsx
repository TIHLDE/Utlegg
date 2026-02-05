"use server";

import { getCurrentSession } from "@/lib/auth/auth";
import { getMyUserInfo } from "@/lib/auth/actions";
import IdrettslagForm from "./_components/form";

export default async function IdrettslagStottePage() {
  const token = await getCurrentSession();
  const user = await getMyUserInfo(token!);

  return (
    <div className="flex items-center justify-center mt-12 md:mt-20 pb-12">
      <IdrettslagForm userToken={token!} user={user} />
    </div>
  );
}
