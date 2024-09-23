import Auth from "@/components/auth/auth";
import { validateRequest } from "@/lib/auth/validate-request";
import { redirect } from "next/navigation";

export default async function Home() {
  const { user: loggedInUser } = await validateRequest();

  if (loggedInUser) {
    return redirect("/home");
  }

  return (
    <div className="px-4 pb-4 md:p-4 flex flex-col h-screen justify-between">
      <Auth />
    </div>
  );
}
