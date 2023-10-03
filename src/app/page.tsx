import { Icons } from "@/components/icons";
import { footerLinks } from "../../constants";
import AuthForm from "@/components/auth-form";
import getCurrentSession from "@/lib/getCurrentSession";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getCurrentSession();

  if (session?.user) {
    return redirect("/home");
  }

  return (
    <div className="p-4 flex flex-col h-screen justify-between">
      <div className="flex w-full flex-1 justify-evenly items-center">
        <div className="w-[55%] flex items-center justify-center">
          <div className="w-[400px]">{/* <Icons.x /> */}</div>
        </div>
        <div className="w-[45%]">
          <div className="mb-8 flex flex-col gap-12">
            <h1 className="font-bold text-6xl">Happening now</h1>
            <h2 className="font-bold text-4xl">Join today.</h2>
          </div>
          <AuthForm />
        </div>
      </div>
      <div className="flex gap-3 justify-center">
        {footerLinks.map((link: string) => (
          <div key={link} className="text-sm text-zinc-500">
            {link}
          </div>
        ))}
      </div>
    </div>
  );
}
