import Header from "@/components/header";
import PersonalInfoWrapper from "@/components/profile/personal/personal-info-wrapper";
import PersonalProfileInfo from "@/components/profile/personal/personal-profile-info";
import PersonalTabsWrapper from "@/components/profile/personal/personal-tabs-wrapper";
import db from "@/lib/db";
import { likeTable, postTable, userTable } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { PropsWithChildren } from "react";

type Props = {
  params: { username: string };
};

export default async function Layout({
  children,
  params: { username },
}: PropsWithChildren<Props>) {
  return (
    <div className="relative border-x min-h-screen">
      <PersonalInfoWrapper username={username} />
      <PersonalTabsWrapper username={username}>{children}</PersonalTabsWrapper>
    </div>
  );
}
