"use server";

import { getMyUserInfo, getUserMemberships } from "@/lib/auth/actions";
import { getCurrentSession } from "@/lib/auth/auth";
import ApplicationForm from "./_components/form";

export default async function ApplicationPage() {
    const token = await getCurrentSession();
    const user = await getMyUserInfo(token!);
    const memberships = await getUserMemberships(token!);

    return (
        <div className="flex items-center justify-center mt-12 md:mt-20 pb-12">
            <ApplicationForm
                userToken={token!}
                user={user!}
                memberships={memberships?.results || []}
            />
        </div>
    );
};