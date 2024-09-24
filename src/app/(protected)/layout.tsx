import { ReactNode } from "react";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import db from "@/lib/db";
import { notificationTable } from "@/lib/db/schema";
import { validateRequest } from "@/lib/auth/validate-request";
import LeftSidebar from "@/components/sidebar/left/left-sidebar";
import RightSidebar from "@/components/sidebar/right/right-sidebar";

type Props = {
  children: ReactNode;
  composeModal: ReactNode;
  postPhotoModal: ReactNode;
  profilePhotoModal: ReactNode;
};

export default async function Layout({
  children,
  composeModal,
  postPhotoModal,
  profilePhotoModal,
}: Props) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) {
    return redirect("/");
  }

  const notifications = await db
    .select()
    .from(notificationTable)
    .where(
      and(
        eq(notificationTable.recipientId, loggedInUser.id),
        eq(notificationTable.read, false)
      )
    );

  return (
    <div className="flex justify-center w-full">
      <div className="relative flex justify-center">
        <LeftSidebar user={loggedInUser} initialNotifications={notifications} />
      </div>
      <section className="relative flex min-h-screen max-md:w-full">
        <div
          className="sm-plus:w-[600px] w-full relative"
          aria-label="Home timeline"
          tabIndex={0}
        >
          {children}
          {composeModal}
          {postPhotoModal}
          {profilePhotoModal}
        </div>
        <RightSidebar />
      </section>
    </div>
  );
}
