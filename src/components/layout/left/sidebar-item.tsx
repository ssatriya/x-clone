import { Icons } from "@/components/icons";
import { cn, removeAtSymbol } from "@/lib/utils";
import { User } from "@prisma/client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type SidebarItemProps = {
  label: string;
  icon: string;
  href: string;
  disabled: boolean;
  currentUser: User;
};

export default function SidebarItem({
  label,
  icon,
  href,
  disabled,
  currentUser,
}: SidebarItemProps) {
  const path = usePathname();
  const username = removeAtSymbol(currentUser.username);

  const Icon = Icons[icon];

  return (
    <Link href={href} className="hover:bg-hover w-fit p-3 rounded-full">
      <div className="flex items-center justify-center">
        {path === href ? (
          <Icon
            className={cn(
              "w-[27px] h-[27px] fill-neutral-100",
              label === "Profile" || (label === "Home" && "stroke-neutral-100")
            )}
          />
        ) : (
          <Icon
            strokeWidth={2}
            className={cn(
              "w-[27px] h-[27px]",
              label === "Home" || label === "Profile"
                ? "stroke-neutral-100"
                : "fill-neutral-100"
            )}
          />
        )}
        <div
          className={cn(
            path === href ? "font-bold" : "font-normal",
            "text-xl pr-4 pl-5"
          )}
        >
          {label}
        </div>
      </div>
    </Link>
  );
}
