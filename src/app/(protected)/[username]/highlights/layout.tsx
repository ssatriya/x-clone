import PersonalInfoWrapper from "@/components/profile/personal/personal-info-wrapper";

import PersonalTabsWrapper from "@/components/profile/personal/personal-tabs-wrapper";

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
