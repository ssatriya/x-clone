import { redirect } from "next/navigation";

import { sleep } from "@/lib/utils";
import HomeTab from "@/components/home/home-tab";
import { validateRequest } from "@/lib/auth/validate-request";

export default async function Page() {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) return redirect("/");

  await sleep(1000);

  return <HomeTab loggedInUser={loggedInUser} />;
}
