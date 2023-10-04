import getCurrentSession from "@/lib/getCurrentSession";
import { redirect } from "next/navigation";
import AuthWrapper from "@/components/auth-wrapper";

export default async function Home() {
  const session = await getCurrentSession();

  if (session?.user) {
    return redirect("/home");
  }

  return (
    <div className="p-4 flex flex-col h-screen justify-between">
      <AuthWrapper />
    </div>
  );
}
