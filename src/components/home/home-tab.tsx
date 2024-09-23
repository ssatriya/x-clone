"use client";

import { User } from "lucia";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocalStorage } from "@mantine/hooks";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";

import { cn } from "@/lib/utils";
import Icons from "@/components/icons";
import ForYouFeed from "./for-you-feed";
import PostInput from "./input/post-input";
import Button from "@/components/ui/button";
import FollowingFeed from "./following-feed";
import useScrollPosition from "@/hooks/useScrollPosition";

type Props = {
  loggedInUser: User;
};

const HomeTab = ({ loggedInUser }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserScroll, setIsUserScroll] = useState(false);
  const scrollY = useScrollPosition();

  useEffect(() => {
    if (scrollY > 0) {
      setIsUserScroll(true);
    } else {
      setIsUserScroll(false);
    }
  }, [scrollY]);

  const toggleNav = () => setIsOpen((prev) => !prev);

  const [value, setValue] = useLocalStorage({
    key: "home-feed",
    defaultValue: 0,
  });

  const onChangeHandler = (index: number) => {
    setValue(index);
  };

  return (
    <>
      <div className="relative flex flex-col items-center w-full">
        <div className="min-[700px]:w-[598px] w-full">
          <TabGroup selectedIndex={value} onChange={onChangeHandler}>
            <TabList className="border-b rounded-none p-0 gap-0 w-full sm-plus:w-[598px] bg-black/60 z-30 backdrop-blur-md justify-evenly flex flex-col items-center h-[106px] min-[550px]:h-[53px] fixed top-0">
              <div className="h-[53px] flex relative items-center w-full px-4 min-[550px]:hidden">
                <Image
                  src={loggedInUser.photo!}
                  width={32}
                  height={32}
                  alt="user profile"
                  className="rounded-full"
                  onClick={toggleNav}
                />
                <Icons.x className="absolute w-6 h-6 -translate-x-1/2 left-1/2 fill-neutral-100" />
              </div>
              <div className="flex h-[53px] w-full">
                <Tab className="relative flex items-center justify-center h-full rounded-none px-4 w-full text-[15px]/5 text-white data-[hover]:bg-white/5 focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white group">
                  <span className="font-medium text-gray group-data-[headlessui-state^=selected]:font-bold group-data-[headlessui-state^=selected]:text-white">
                    For you
                  </span>
                  <div className="absolute bottom-0 w-[56px] rounded-full h-1 bg-primary opacity-0 group-data-[headlessui-state^=selected]:opacity-100" />
                </Tab>
                <Tab className="relative flex items-center justify-center h-full rounded-none px-4 w-full text-[15px]/5 text-white data-[hover]:bg-white/5 focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white group">
                  <span className="font-medium text-gray group-data-[headlessui-state^=selected]:font-bold group-data-[headlessui-state^=selected]:text-white">
                    Following
                  </span>
                  <div className="absolute bottom-0 w-[69px] rounded-full h-1 bg-primary opacity-0 group-data-[headlessui-state^=selected]:opacity-100" />
                </Tab>
              </div>
            </TabList>
            <TabPanels>
              <TabPanel tabIndex={-1}>
                <div className="mt-[106px] min-[550px]:mt-[53px] w-full h-full">
                  <PostInput loggedInUser={loggedInUser} />
                  <ForYouFeed loggedInUser={loggedInUser} />
                </div>
              </TabPanel>
              <TabPanel tabIndex={-1}>
                <div className="mt-[106px] min-[550px]:mt-[53px] w-full h-full">
                  <PostInput loggedInUser={loggedInUser} />
                  <FollowingFeed loggedInUser={loggedInUser} />
                </div>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>
      </div>

      {/* ============ */}
      <nav
        className={`fixed top-0 left-0 h-full w-[280px] bg-black text-white transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } z-50`}
      >
        <div className="flex flex-col p-4">
          <Image
            src={loggedInUser.photo!}
            width={40}
            height={40}
            className="rounded-full"
            alt="profile photo"
          />
          <div className="flex flex-col mt-2 leading-5">
            <span className="text-[17px] font-bold text-secondary-lighter">
              {loggedInUser.name}
            </span>
            <span className="text-[15px] text-gray">
              {loggedInUser.username}
            </span>
          </div>
          <div className="flex gap-5 mt-3 text-sm">
            <span className="text-gray">
              <span className="font-bold text-secondary-lighter">2</span>{" "}
              Following
            </span>
            <span className="text-gray">
              <span className="font-bold text-secondary-lighter">5</span>{" "}
              Followers
            </span>
          </div>
        </div>
        <ul>
          {[
            {
              icon: (
                <Icons.profile className="w-6 h-6 fill-secondary-lighter" />
              ),
              label: "Profile",
            },
            {
              icon: <Icons.x className="w-6 h-6 fill-secondary-lighter" />,
              label: "Premium",
            },
            {
              icon: <Icons.lists className="w-6 h-6 fill-secondary-lighter" />,
              label: "Lists",
            },
            {
              icon: (
                <Icons.bookmark className="w-6 h-6 fill-secondary-lighter" />
              ),
              label: "Bookmarks",
            },
            {
              icon: (
                <Icons.business className="w-6 h-6 fill-secondary-lighter" />
              ),
              label: "Business",
            },
            {
              icon: (
                <Icons.monetization className="w-6 h-6 fill-secondary-lighter" />
              ),
              label: "Monetization",
            },
            {
              icon: <Icons.ads className="w-6 h-6 fill-secondary-lighter" />,
              label: "Ads",
            },
            {
              icon: <Icons.jobs className="w-6 h-6 fill-secondary-lighter" />,
              label: "Jobs",
            },
            {
              icon: (
                <Icons.settings className="w-6 h-6 fill-secondary-lighter" />
              ),
              label: "Settings and privacy",
            },
            {
              icon: <Icons.logout className="w-6 h-6 fill-secondary-lighter" />,
              label: "Log out",
            },
          ].map((item, index) => (
            <li key={index} className="w-full p-4">
              <Link href="#" className="flex items-center gap-6">
                {item.icon}
                <span className="text-xl font-bold leading-6">
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div
        className={`fixed inset-0 bg-backdrop transition-opacity duration-300 ease-in-out ${
          isOpen ? "opacity-50 z-40" : "opacity-0 -z-10"
        }`}
        onClick={toggleNav}
        aria-hidden="true"
      />

      <Link
        href="/compose/post"
        scroll={false}
        className="min-[550px]:hidden block fixed bottom-6 right-6 z-50"
        tabIndex={-1}
      >
        <Button
          variant="default"
          size="icon"
          className={cn(
            "h-[50px] w-[50px] my-4 opacity-100 transition-opacity duration-200",
            isUserScroll && "opacity-50"
          )}
        >
          <Icons.compose className="w-6 h-6 fill-secondary-lighter" />
        </Button>
      </Link>
    </>
  );
};

export default HomeTab;
