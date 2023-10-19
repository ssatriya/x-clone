import Header from "@/components/layout/center/header";
import HomeTabs from "@/components/layout/center/home/home-tabs";
import OnboardingModal from "@/components/modal/onboarding/onboarding-modal";
import { db } from "@/lib/db";
import getCurrentSession from "@/lib/getCurrentSession";
import { redirect } from "next/navigation";
import * as React from "react";
import MobileHeader from "@/components/layout/center/mobile-header";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getCurrentSession();

  if (!session?.user) {
    return redirect("/");
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.userId,
    },
    include: {
      followers: true,
      following: true,
    },
  });

  const isOnboarded = user?.onboarding;

  if (!user) {
    return redirect("/");
  }

  if (!isOnboarded) {
    return (
      <>
        <Header title="Home" />
        <OnboardingModal user={user} />
      </>
    );
  }

  return (
    <>
      <div className="hidden md:flex">
        <Header title="Home" />
      </div>
      <MobileHeader currentUser={user} />
      <HomeTabs user={user} />
    </>
  );
}
