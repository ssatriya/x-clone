import Header from "@/components/header";
import PersonalInfoWrapper from "@/components/profile/personal/personal-info-wrapper";
import PersonalProfileInfo from "@/components/profile/personal/personal-profile-info";
import PersonalTabsWrapper from "@/components/profile/personal/personal-tabs-wrapper";
import PublicInfoWrapper from "@/components/profile/public/public-info-wrapper";
import PublicTabsWrapper from "@/components/profile/public/public-tabs-wrapper";
import { validateRequest } from "@/lib/auth/validate-request";
import db from "@/lib/db";
import { postTable, userTable } from "@/lib/db/schema";
import { redirect } from "next/navigation";

import { PropsWithChildren } from "react";

type Props = {
  params: { username: string };
};

export default async function Layout({
  children,
  params: { username },
}: PropsWithChildren<Props>) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) return redirect("/");

  const isOwnProfile = loggedInUser.username === `@${username}`;

  return (
    <div className="relative border-x w-full" style={{ height: "1200%" }}>
      {isOwnProfile && (
        <>
          <PersonalInfoWrapper username={username} />
          <PersonalTabsWrapper username={username}>
            {children}
          </PersonalTabsWrapper>
        </>
      )}
      {!isOwnProfile && (
        <>
          <PublicInfoWrapper username={username} loggedInUser={loggedInUser} />
          <PublicTabsWrapper username={username}>{children}</PublicTabsWrapper>
        </>
      )}
    </div>
  );
}
