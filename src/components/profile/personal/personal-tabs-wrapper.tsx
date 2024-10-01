"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";

import Icons from "@/components/icons";
import Button from "@/components/ui/button";
import { getInitialIndex } from "@/lib/utils";

type Props = {
  username: string;
};

const routeIndexMap: Record<string, number> = {
  posts: 0,
  with_replies: 1,
  highlights: 2,
  articles: 3,
  media: 4,
  likes: 5,
};

const PersonalTabsWrapper = ({
  children,
  username,
}: PropsWithChildren<Props>) => {
  const router = useRouter();
  const pathname = usePathname();
  const tabListRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const [currentDirection, setCurrentDirection] = useState<"left" | "right">(
    "left"
  );

  const defaultTab = "posts";

  const [selectedIndex, setSelectedIndex] = useState(
    getInitialIndex({ pathname, routeIndexMap, defaultTab })
  );

  useEffect(() => {
    const currentRoute = pathname.split("/").pop();
    const index = routeIndexMap[currentRoute || defaultTab];
    setSelectedIndex(index);
  }, [pathname]);

  const onChangeHandler = (index: number) => {
    setSelectedIndex(index);

    const pathMap: Record<number, string> = {
      0: `/${username}`,
      1: `/${username}/with_replies`,
      2: `/${username}/highlights`,
      3: `/${username}/articles`,
      4: `/${username}/media`,
      5: `/${username}/likes`,
    };

    const path = pathMap[index];
    if (path) {
      startTransition(() => {
        router.push(path);
      });
    }
  };
  console.log({ isPending });

  const scroll = (direction: "left" | "right") => {
    setCurrentDirection(direction);
    if (tabListRef.current) {
      const scrollAmount = direction === "left" ? -100 : 100;

      if (tabListRef.current) {
        tabListRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="min-[700px]:w-[598px] w-full">
        <TabGroup
          className="h-[53px] relative group/personal-tab"
          selectedIndex={selectedIndex}
          onChange={onChangeHandler}
        >
          {currentDirection !== "left" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                scroll("left");
              }}
              className="w-[34px] h-[34px] z-40 bg-hover hover:bg-border xs:opacity-0 xs:group-hover/personal-tab:opacity-100 absolute left-3 bottom-1/2 translate-y-1/2 flex items-center justify-center xs:hidden"
            >
              <Icons.arrowLeft className="h-5 w-5 fill-secondary-lighter" />
            </Button>
          )}
          {currentDirection !== "right" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                scroll("right");
              }}
              className="w-[34px] h-[34px] z-40 bg-hover hover:bg-border xs:opacity-0 xs:group-hover/personal-tab:opacity-100 absolute right-3 bottom-1/2 translate-y-1/2 flex items-center justify-center xs:hidden"
            >
              <Icons.arrowRight className="h-5 w-5 fill-secondary-lighter" />
            </Button>
          )}
          <TabList
            ref={tabListRef}
            className="h-full border-b rounded-none p-0 gap-0 w-full sm-plus:w-[598px] bg-black z-30 backdrop-blur-md justify-evenly flex items-center overflow-x-auto scrollbar-hide"
          >
            <Tab className="relative flex items-center justify-center h-full rounded-none px-4 w-full text-[15px]/5 text-white focus:outline-none data-[hover]:bg-white/5 data-[focus]:outline-1 data-[focus]:outline-white group">
              <span className="font-medium text-gray group-data-[headlessui-state^=selected]:font-bold group-data-[headlessui-state^=selected]:text-white">
                Posts
              </span>
              <div className="absolute bottom-0 w-[56px] rounded-full h-1 bg-primary opacity-0 group-data-[headlessui-state^=selected]:opacity-100" />
            </Tab>
            <Tab className="relative flex items-center justify-center h-full rounded-none px-4 w-full text-[15px]/5 text-white focus:outline-none data-[hover]:bg-white/5 data-[focus]:outline-1 data-[focus]:outline-white group">
              <span className="font-medium text-gray group-data-[headlessui-state^=selected]:font-bold group-data-[headlessui-state^=selected]:text-white">
                Replies
              </span>
              <div className="absolute bottom-0 w-[69px] rounded-full h-1 bg-primary opacity-0 group-data-[headlessui-state^=selected]:opacity-100" />
            </Tab>
            <Tab className="relative flex items-center justify-center h-full rounded-none px-4 w-full text-[15px]/5 text-white focus:outline-none data-[hover]:bg-white/5 data-[focus]:outline-1 data-[focus]:outline-white group">
              <span className="font-medium text-gray group-data-[headlessui-state^=selected]:font-bold group-data-[headlessui-state^=selected]:text-white">
                Highlights
              </span>
              <div className="absolute bottom-0 w-[73px] rounded-full h-1 bg-primary opacity-0 group-data-[headlessui-state^=selected]:opacity-100" />
            </Tab>
            <Tab className="relative flex items-center justify-center h-full rounded-none px-4 w-full text-[15px]/5 text-white focus:outline-none data-[hover]:bg-white/5 data-[focus]:outline-1 data-[focus]:outline-white group">
              <span className="font-medium text-gray group-data-[headlessui-state^=selected]:font-bold group-data-[headlessui-state^=selected]:text-white">
                Articles
              </span>
              <div className="absolute bottom-0 w-[56px] rounded-full h-1 bg-primary opacity-0 group-data-[headlessui-state^=selected]:opacity-100" />
            </Tab>
            <Tab className="relative flex items-center justify-center h-full rounded-none px-4 w-full text-[15px]/5 text-white focus:outline-none data-[hover]:bg-white/5 data-[focus]:outline-1 data-[focus]:outline-white group">
              <span className="font-medium text-gray group-data-[headlessui-state^=selected]:font-bold group-data-[headlessui-state^=selected]:text-white">
                Media
              </span>
              <div className="absolute bottom-0 w-[56px] rounded-full h-1 bg-primary opacity-0 group-data-[headlessui-state^=selected]:opacity-100" />
            </Tab>
            <Tab className="relative flex items-center justify-center h-full rounded-none px-4 w-full text-[15px]/5 text-white focus:outline-none data-[hover]:bg-white/5 data-[focus]:outline-1 data-[focus]:outline-white group">
              <span className="font-medium text-gray group-data-[headlessui-state^=selected]:font-bold group-data-[headlessui-state^=selected]:text-white">
                Likes
              </span>
              <div className="absolute bottom-0 w-[56px] rounded-full h-1 bg-primary opacity-0 group-data-[headlessui-state^=selected]:opacity-100" />
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              {!isPending && <div className="md:w-[599px]">{children}</div>}
              {isPending && (
                <div className="w-full h-full flex items-start justify-center mt-10">
                  <span className="loader" />
                </div>
              )}
            </TabPanel>
            <TabPanel>
              {!isPending && <div className="md:w-[599px]">{children}</div>}
              {isPending && (
                <div className="w-full h-full flex items-start justify-center mt-10">
                  <span className="loader" />
                </div>
              )}
            </TabPanel>
            <TabPanel>
              {!isPending && <div className="md:w-[599px]">{children}</div>}
              {isPending && (
                <div className="w-full h-full flex items-start justify-center mt-10">
                  <span className="loader" />
                </div>
              )}
            </TabPanel>
            <TabPanel>
              {!isPending && <div className="md:w-[599px]">{children}</div>}
              {isPending && (
                <div className="w-full h-full flex items-start justify-center mt-10">
                  <span className="loader" />
                </div>
              )}
            </TabPanel>
            <TabPanel>
              {!isPending && <div className="md:w-[599px]">{children}</div>}
              {isPending && (
                <div className="w-full h-full flex items-start justify-center mt-10">
                  <span className="loader" />
                </div>
              )}
            </TabPanel>
            <TabPanel>
              <div className="md:w-[599px]">
                <div className="px-4 py-3 bg-[#02113d] flex gap-2 leading-4 m-1 rounded-md">
                  <Icons.lock className="h-[18.5] w-[18.5px] fill-white" />
                  <span className="text-sm">
                    Your likes are private. Only you can see them.
                  </span>
                </div>
                {!isPending && children}
                {isPending && (
                  <div className="w-full h-full flex items-start justify-center mt-10">
                    <span className="loader" />
                  </div>
                )}
              </div>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  );
};

export default PersonalTabsWrapper;
