import { PropsWithChildren } from "react";

import Header from "@/components/header";
import NotificationTabWrapper from "@/components/notification/notification-tab-wrapper";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="border-x w-full min-h-screen relative">
      <Header title="Notifications" />
      <NotificationTabWrapper>{children}</NotificationTabWrapper>
    </div>
  );
}
