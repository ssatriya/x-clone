import { redirect } from "next/navigation";

import LeftSidebar from "@/components/layout/left/left-sidebar";
import RightSidebar from "@/components/layout/right/right-sidebar";
import getCurrentSession from "@/lib/getCurrentSession";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";

export default async function HomeLayout({
  children,
  photoModal,
}: {
  children: React.ReactNode;
  photoModal: React.ReactNode;
}) {
  const session = await getCurrentSession();

  if (!session?.user) {
    return redirect("/");
  }

  const onboarded = await db.user.findUnique({
    where: {
      id: session.user.userId,
    },
  });

  const currentUser = await db.user.findUnique({
    where: {
      id: session.user.userId,
    },
  });

  const isOnboarded = onboarded?.onboarding;

  // Temorary
  if (!currentUser) {
    return redirect("/");
  }

  return (
    <div className="flex justify-center">
      <LeftSidebar currentUser={currentUser} />
      <main className="min-h-screen flex gap-8">
        <div
          className={cn(
            isOnboarded ? "border-x h-full w-[600px]" : "w-[600px]"
          )}
        >
          {photoModal}
          {children}
        </div>
        {isOnboarded ? <RightSidebar /> : <div className="w-[348px] mr-6" />}
      </main>
    </div>
  );
}
