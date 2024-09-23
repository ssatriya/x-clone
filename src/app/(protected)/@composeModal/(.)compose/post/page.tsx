import { redirect } from "next/navigation";

import { validateRequest } from "@/lib/auth/validate-request";
import ComposeModal from "@/components/home/modal/compose-modal";

export default async function Page() {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) {
    return redirect("/");
  }

  return <ComposeModal loggedInUser={loggedInUser} />;
}
