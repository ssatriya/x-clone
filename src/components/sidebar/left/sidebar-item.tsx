"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import Icons from "@/components/icons";
import { cn, getBasePath } from "@/lib/utils";

type Props = {
  icon: string;
  href: string;
  label: string;
  disabled: boolean;
  ariaLabel: string;
  hasNotification?: boolean;
  count?: number;
};

const SidebarItem = ({
  label,
  icon,
  href,
  disabled,
  ariaLabel,
  hasNotification,
  count,
}: Props) => {
  const pathname = usePathname();

  const hasStatusPath = (path: string): boolean => {
    const segments = path.split("/");
    return segments.length > 2 && segments[2] === "status";
  };

  const statusPath = hasStatusPath(pathname);
  const path = getBasePath(pathname);

  const Icon =
    label === "Notifications" && path === href
      ? Icons["notificationFill"]
      : Icons[icon];

  if (href == "#") {
    return (
      <div
        aria-label={ariaLabel}
        className={cn(
          "group w-full",
          disabled && "cursor-not-allowed text-neutral-400"
        )}
      >
        <div className="flex items-center group-hover:bg-hover rounded-full p-3 justify-start h-full w-fit">
          {path === href ? (
            <Icon
              className={cn(
                "w-[27px] h-[27px] fill-neutral-100",
                label === "Profile" ||
                  (label === "Home" && "stroke-neutral-100")
              )}
            />
          ) : (
            <Icon
              strokeWidth={2}
              className={cn(
                "w-[27px] h-[27px]",
                label === "Home" || label === "Profile"
                  ? "stroke-neutral-100"
                  : "fill-neutral-100",
                disabled && "fill-neutral-400"
              )}
            />
          )}
          <div
            className={cn(
              path === href ? "font-bold" : "font-normal",
              "text-xl pr-4 pl-5 hidden min-[1300px]:block"
            )}
          >
            {label}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group w-full">
      <Link
        aria-label={ariaLabel}
        href={href}
        className={cn(
          "w-fit focus-visible:rounded-full",
          disabled && "cursor-not-allowed text-neutral-400"
        )}
      >
        <div className="flex items-center group-hover:bg-hover rounded-full p-3 justify-start h-full w-fit">
          {path === href && !statusPath ? (
            <div className="relative">
              <Icon
                className={cn(
                  "w-[27px] h-[27px] fill-neutral-100",
                  label === "Profile" ||
                    (label === "Home" && "stroke-neutral-100")
                )}
              />
              {hasNotification && (
                <div className="w-[18px] h-[18px] bg-primary flex items-center justify-center rounded-full absolute -top-[5px] -right-1 border border-black">
                  <span className="text-[11px] leading-3">{count}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <Icon
                strokeWidth={2}
                className={cn(
                  "w-[27px] h-[27px]",
                  label === "Home" || label === "Profile"
                    ? "stroke-neutral-100"
                    : "fill-neutral-100",
                  disabled && "fill-neutral-400"
                )}
              />
              {hasNotification && (
                <div className="w-[18px] h-[18px] bg-primary flex items-center justify-center rounded-full absolute -top-[5px] -right-1 border border-black">
                  <span className="text-[11px] leading-3">{count}</span>
                </div>
              )}
            </div>
          )}
          <div
            className={cn(
              path === href && !statusPath ? "font-bold" : "font-normal",
              "text-xl pr-4 pl-5 hidden min-[1300px]:block"
            )}
          >
            {label}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default SidebarItem;
