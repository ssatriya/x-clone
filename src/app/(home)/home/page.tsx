import Header from "@/components/layout/center/header";
import HomeTabs from "@/components/layout/center/home/home-tabs";
import OnboardingModal from "@/components/modal/onboarding/onboarding-modal";
import { db } from "@/lib/db";
import getCurrentSession from "@/lib/getCurrentSession";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getCurrentSession();

  if (!session?.user) {
    return redirect("/");
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.userId,
    },
  });

  const isOnboarded = user?.onboarding;

  if (!user) {
    return redirect("/");
  }

  if (!isOnboarded) {
    return (
      <div className="">
        <Header title="Home" />
        <OnboardingModal user={user} />
      </div>
    );
  }

  return (
    <div className="">
      <Header title="Home" />
      <HomeTabs user={user} />
    </div>
  );
}
