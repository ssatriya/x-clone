"use client";

import { usePathname, useRouter } from "next/navigation";
import { PropsWithChildren, useEffect, useState } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { getInitialIndex } from "@/lib/utils";

type Props = {
  username: string;
};

const routeIndexMap: Record<string, number> = {
  verified_followers: 0,
  followers: 1,
  following: 2,
};

const FollowTabsWrapper = ({
  children,
  username,
}: PropsWithChildren<Props>) => {
  const router = useRouter();
  const pathname = usePathname();

  const defaultTab = "verified_followers";

  const [selectedIndex, setSelectedIndex] = useState(
    getInitialIndex({
      pathname,
      routeIndexMap,
      defaultTab,
    })
  );

  useEffect(() => {
    const currentRoute = pathname.split("/").pop();
    const index = routeIndexMap[currentRoute || defaultTab];
    setSelectedIndex(index);
  }, [router, pathname]);

  const onChangeHandler = (index: number) => {
    setSelectedIndex(index);

    const pathMap: Record<number, string> = {
      0: `/${username}/verified_followers`,
      1: `/${username}/followers`,
      2: `/${username}/following`,
    };

    const path = pathMap[index];
    if (path) {
      router.push(path);
    }
  };
  return (
    <div className="flex flex-col w-full ">
      <div className="h-[53px] min-[517px]:hidden" />
      <div className="min-[700px]:w-[598px] w-full">
        <TabGroup
          className="h-[53px]"
          selectedIndex={selectedIndex}
          onChange={onChangeHandler}
        >
          <TabList className="h-full border-b rounded-none p-0 gap-0 w-full md:w-[598px] z-40 backdrop-blur-md justify-evenly flex items-center">
            <Tab className="relative flex items-center justify-center h-full rounded-none px-4 w-full text-[15px]/5 text-white focus:outline-none data-[hover]:bg-white/5 data-[focus]:outline-1 data-[focus]:outline-white group">
              <span className="font-medium text-gray group-data-[headlessui-state^=selected]:font-bold group-data-[headlessui-state^=selected]:text-white">
                Verified Followers
              </span>
              <div className="absolute bottom-0 w-[130px] rounded-full h-1 bg-primary opacity-0 group-data-[headlessui-state^=selected]:opacity-100" />
            </Tab>
            <Tab className="relative flex items-center justify-center h-full rounded-none px-4 w-full text-[15px]/5 text-white focus:outline-none data-[hover]:bg-white/5 data-[focus]:outline-1 data-[focus]:outline-white group">
              <span className="font-medium text-gray group-data-[headlessui-state^=selected]:font-bold group-data-[headlessui-state^=selected]:text-white">
                Followers
              </span>
              <div className="absolute bottom-0 w-[70px] rounded-full h-1 bg-primary opacity-0 group-data-[headlessui-state^=selected]:opacity-100" />
            </Tab>
            <Tab className="relative flex items-center justify-center h-full rounded-none px-4 w-full text-[15px]/5 text-white focus:outline-none data-[hover]:bg-white/5 data-[focus]:outline-1 data-[focus]:outline-white group">
              <span className="font-medium text-gray group-data-[headlessui-state^=selected]:font-bold group-data-[headlessui-state^=selected]:text-white">
                Following
              </span>
              <div className="absolute bottom-0 w-[70px] rounded-full h-1 bg-primary opacity-0 group-data-[headlessui-state^=selected]:opacity-100" />
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <div className="md:w-[599px]">{children}</div>
            </TabPanel>
            <TabPanel>
              <div className="md:w-[599px]">{children}</div>
            </TabPanel>
            <TabPanel>
              <div className="md:w-[599px]">{children}</div>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  );
};

export default FollowTabsWrapper;
