import { PropsWithChildren } from "react";

import Header from "@/components/header";
import FollowTabsWrapper from "@/components/profile/follow/follow-tabs-wrapper";
import db from "@/lib/db";
import { userTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type Props = {
  params: { username: string };
};

export default async function Layout({
  children,
  params: { username },
}: PropsWithChildren<Props>) {
  const [user] = await db
    .select({
      name: userTable.name,
      username: userTable.username,
    })
    .from(userTable)
    .where(eq(userTable.username, `@${username}`));

  return (
    <div className="relative border-x min-h-screen">
      <Header title={user.name} subtitle={user.username} backButton={true} />
      <FollowTabsWrapper username={username}>{children}</FollowTabsWrapper>
    </div>
  );
}
