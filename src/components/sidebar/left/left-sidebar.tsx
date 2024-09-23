"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

import Icons from "@/components/icons";
import SidebarItem from "./sidebar-item";
import { logout } from "@/app/actions/logout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useMediaQuery } from "@mantine/hooks";
import { useEffect, useState } from "react";

type Props = {
  photo?: string | undefined;
  username?: string | undefined;
  name?: string | undefined;
};

const LeftSidebar = ({ photo, name, username }: Props) => {
  const router = useRouter();
  const mediaQuery = useMediaQuery("(min-width: 1300px)");
  const [isNormalSidebar, setIsNormalSidebar] = useState(true);

  useEffect(() => {
    if (!mediaQuery) {
      setIsNormalSidebar(false);
    } else {
      setIsNormalSidebar(true);
    }
  }, [mediaQuery]);

  const routes = [
    {
      label: "Home",
      ariaLabel: "Your home feed",
      icon: "home",
      href: `/home`,
      disabled: false,
    },
    {
      label: "Explore",
      ariaLabel: "Explore",
      icon: "explore",
      href: "#",
      disabled: true,
    },
    {
      label: "Notifications",
      ariaLabel: "View notifications",
      icon: "notifications",
      href: "#",
      disabled: true,
    },
    {
      label: "Messages",
      ariaLabel: "Your private messages",
      icon: "messages",
      href: "#",
      disabled: true,
    },
    {
      label: "Lists",
      ariaLabel: "Your lists",
      icon: "lists",
      href: "#",
      disabled: true,
    },
    {
      label: "Bookmarks",
      ariaLabel: "Bookmarks",
      icon: "bookmark",
      href: "#",
      disabled: true,
    },
    {
      label: "Communities",
      ariaLabel: "Community page",
      icon: "communities",
      href: "#",
      disabled: true,
    },
    {
      label: "Verified Orgs",
      ariaLabel: "Verified orgs",
      icon: "verifiedOrgs",
      href: "#",
      disabled: true,
    },
    {
      label: "Profile",
      ariaLabel: "Your profile",
      icon: "profile",
      href: `/${username?.slice(1)}`,
      disabled: false,
    },
    {
      label: "More",
      ariaLabel: "More menu items",
      icon: "moreCircle",
      href: "#",
      disabled: true,
    },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="hidden min-[550px]:flex pt-1 w-[80px] min-[1300px]:w-[275px] min-h-screen px-2 flex-col max-[1299px]:items-center justify-between max-h-screen sticky top-0 left-0">
      <div>
        <div className="flex flex-col gap-2">
          <div
            aria-label="X"
            role="button"
            onClick={() => router.push("/home")}
            className="mb-2 h-[50px] w-[50px] rounded-full flex items-center justify-center"
          >
            <Icons.x className="w-8 h-8 fill-neutral-100" />
          </div>
          {routes.map((link) => (
            <SidebarItem
              key={link.label}
              label={link.label}
              icon={link.icon}
              href={link.href}
              disabled={link.disabled}
              ariaLabel={link.ariaLabel}
            />
          ))}
          <Link
            href="/compose/post"
            scroll={false}
            className="min-[1300px]:hidden block"
            tabIndex={-1}
          >
            <Button
              variant="default"
              size="icon"
              className="h-[50px] w-[50px] my-4"
            >
              <Icons.compose className="w-6 h-6 fill-secondary-lighter" />
            </Button>
          </Link>
          <Link
            href="/compose/post"
            scroll={false}
            className="hidden min-[1300px]:block"
            tabIndex={-1}
          >
            <Button
              variant="default"
              size="lg"
              className="font-bold text-[17px] leading-5 w-[90%] my-4"
            >
              Posts
            </Button>
          </Link>
        </div>
      </div>

      {/*  */}

      <Menu>
        <MenuButton className="flex items-center justify-between w-full p-3 mb-4 transition-colors rounded-full hover:bg-secondary-lighter/10">
          <div className="min-[1300px]:hidden block">
            <Image
              src={photo!}
              alt={username!}
              height={40}
              width={40}
              className="flex-shrink-0 rounded-full"
            />
          </div>
          <div className="min-[1300px]:flex justify-between w-full items-center hidden">
            <div className="flex gap-2">
              <Image
                src={photo!}
                alt={username!}
                height={40}
                width={40}
                className="rounded-full"
              />
              <div className="flex flex-col items-start">
                <span className="text-[15px] font-bold leading-5">{name}</span>
                <span className="text-[15px] leading-5 text-gray">
                  {username}
                </span>
              </div>
            </div>
            <Icons.more className="w-5 h-5 fill-secondary-lighter" />
          </div>
        </MenuButton>
        <MenuItems
          anchor={{
            to: isNormalSidebar ? "bottom" : "bottom start",
            gap: "16px",
          }}
          className="md:w-[300px] w-auto py-3 bg-black shadow-repost rounded-2xl transition duration-300 ease-out data-[closed]:opacity-0 data-[open]:opacity-1"
          transition
        >
          <MenuItem>
            <div className="px-4 py-3 leading-5 cursor-pointer hover:bg-secondary-lighter/10">
              <span className="font-bold text-[15px]">
                Add an existing account
              </span>
            </div>
          </MenuItem>
          <MenuItem>
            <div
              className="px-4 py-3 leading-5 cursor-pointer hover:bg-secondary-lighter/10"
              onClick={handleLogout}
            >
              <span className="font-bold text-[15px]">
                Logged out @ssatriya
              </span>
            </div>
          </MenuItem>
        </MenuItems>
      </Menu>
      {/*  */}
      {/* </div> */}
    </nav>
    // <div className="fixed w-auto xl:w-[275px] pr-4 bottom-4">
    //   <Menu>
    //     <MenuButton className="flex items-center justify-between w-full p-3 transition-colors rounded-full hover:bg-secondary-lighter/10">
    //       <div className="block xl:hidden">
    //         <Image
    //           src={photo!}
    //           alt={username!}
    //           height={40}
    //           width={40}
    //           className="flex-shrink-0 rounded-full"
    //         />
    //       </div>
    //       <div className="hidden xl:block">
    //         <div className="flex gap-2">
    //           <Image
    //             src={photo!}
    //             alt={username!}
    //             height={40}
    //             width={40}
    //             className="rounded-full"
    //           />
    //           <div className="flex flex-col items-start">
    //             <span className="text-[15px] font-bold leading-5">
    //               {name}
    //             </span>
    //             <span className="text-[15px] leading-5 text-gray">
    //               {username}
    //             </span>
    //           </div>
    //         </div>
    //         <Icons.more className="w-5 h-5 fill-secondary-lighter" />
    //       </div>
    //     </MenuButton>
    //     <MenuItems
    //       anchor={{ to: "bottom", gap: "16px" }}
    //       className="md:w-[300px] w-auto py-3 bg-black shadow-repost rounded-2xl transition duration-300 ease-out data-[closed]:opacity-0 data-[open]:opacity-1"
    //       transition
    //     >
    //       <MenuItem>
    //         <div className="px-4 py-3 leading-5 cursor-pointer hover:bg-secondary-lighter/10">
    //           <span className="font-bold text-[15px]">
    //             Add an existing account
    //           </span>
    //         </div>
    //       </MenuItem>
    //       <MenuItem>
    //         <div
    //           className="px-4 py-3 leading-5 cursor-pointer hover:bg-secondary-lighter/10"
    //           onClick={handleLogout}
    //         >
    //           <span className="font-bold text-[15px]">
    //             Logged out @ssatriya
    //           </span>
    //         </div>
    //       </MenuItem>
    //     </MenuItems>
    //   </Menu>
    // </div>
  );
};

export default LeftSidebar;

{
  /* <nav className="px-2 pt-1 w-[72px] xl:w-[275px] w min-h-screen">
      <div className="flex w-[72px] xl:w-[265px] pr-2 flex-col justify-between fixed h-full">
        <div className="flex flex-col gap-2">
          <div
            aria-label="X"
            role="button"
            onClick={() => router.push("/home")}
            className="mb-2 h-[50px] w-[50px] rounded-full flex items-center justify-center"
          >
            <Icons.x className="w-8 h-8 fill-neutral-100" />
          </div>
          {routes.map((link) => (
            <SidebarItem
              key={link.label}
              label={link.label}
              icon={link.icon}
              href={link.href}
              disabled={link.disabled}
              ariaLabel={link.ariaLabel}
            />
          ))}

          <Link
            href="/compose/post"
            scroll={false}
            className="block xl:hidden"
            tabIndex={-1}
          >
            <Button variant="default" size="icon" className="h-[50px] w-[50px]">
              <Icons.compose className="w-6 h-6 fill-secondary-lighter" />
            </Button>
          </Link>
          <Link
            href="/compose/post"
            scroll={false}
            className="hidden xl:block"
            tabIndex={-1}
          >
            <Button
              variant="default"
              size="lg"
              className="font-bold text-[17px] leading-5 w-[90%] my-4"
            >
              Posts
            </Button>
          </Link>
        </div>
      </div>
      <div className="fixed w-auto xl:w-[275px] pr-4 bottom-4">
        <Menu>
          <MenuButton className="flex items-center justify-between w-full p-3 transition-colors rounded-full hover:bg-secondary-lighter/10">
            <div className="block xl:hidden">
              <Image
                src={photo!}
                alt={username!}
                height={40}
                width={40}
                className="flex-shrink-0 rounded-full"
              />
            </div>
            <div className="hidden xl:block">
              <div className="flex gap-2">
                <Image
                  src={photo!}
                  alt={username!}
                  height={40}
                  width={40}
                  className="rounded-full"
                />
                <div className="flex flex-col items-start">
                  <span className="text-[15px] font-bold leading-5">
                    {name}
                  </span>
                  <span className="text-[15px] leading-5 text-gray">
                    {username}
                  </span>
                </div>
              </div>
              <Icons.more className="w-5 h-5 fill-secondary-lighter" />
            </div>
          </MenuButton>
          <MenuItems
            anchor={{ to: "bottom", gap: "16px" }}
            className="md:w-[300px] w-auto py-3 bg-black shadow-repost rounded-2xl transition duration-300 ease-out data-[closed]:opacity-0 data-[open]:opacity-1"
            transition
          >
            <MenuItem>
              <div className="px-4 py-3 leading-5 cursor-pointer hover:bg-secondary-lighter/10">
                <span className="font-bold text-[15px]">
                  Add an existing account
                </span>
              </div>
            </MenuItem>
            <MenuItem>
              <div
                className="px-4 py-3 leading-5 cursor-pointer hover:bg-secondary-lighter/10"
                onClick={handleLogout}
              >
                <span className="font-bold text-[15px]">
                  Logged out @ssatriya
                </span>
              </div>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </nav> */
}
