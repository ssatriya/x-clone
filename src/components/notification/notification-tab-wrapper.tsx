"use client";

import { usePathname, useRouter } from "next/navigation";
import { PropsWithChildren, useEffect, useState, useTransition } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";

import { getInitialIndex } from "@/lib/utils";
import LoadingSpinner from "@/components/loading-spinner";

const routeIndexMap: Record<string, number> = {
  notifications: 0,
  verified: 1,
  mentions: 2,
};

const NotificationTabWrapper = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

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
      0: `/notifications`,
      1: `/notifications/verified`,
      2: `/notifications/mentions`,
    };

    const path = pathMap[index];
    if (path) {
      startTransition(() => {
        router.push(path);
      });
    }
  };

  return (
    <div className="min-[700px]:w-[598px] w-full">
      <TabGroup
        className="h-[53px]"
        selectedIndex={selectedIndex}
        onChange={onChangeHandler}
      >
        <TabList className="h-full border-b rounded-none p-0 gap-0 w-full md:w-[598px] z-40 backdrop-blur-md justify-evenly flex items-center">
          <Tab className="relative flex items-center justify-center h-full rounded-none px-4 w-full text-[15px]/5 text-white focus:outline-none data-[hover]:bg-white/5 data-[focus]:outline-1 data-[focus]:outline-white group">
            <span className="font-medium text-gray group-data-[headlessui-state^=selected]:font-bold group-data-[headlessui-state^=selected]:text-white text-nowrap">
              All
            </span>
            <div className="absolute bottom-0 w-[56px] rounded-full h-1 bg-primary opacity-0 group-data-[headlessui-state^=selected]:opacity-100" />
          </Tab>
          <Tab className="relative flex items-center justify-center h-full rounded-none px-4 w-full text-[15px]/5 text-white focus:outline-none data-[hover]:bg-white/5 data-[focus]:outline-1 data-[focus]:outline-white group">
            <span className="font-medium text-gray group-data-[headlessui-state^=selected]:font-bold group-data-[headlessui-state^=selected]:text-white text-nowrap">
              Verified
            </span>
            <div className="absolute bottom-0 w-[57px] rounded-full h-1 bg-primary opacity-0 group-data-[headlessui-state^=selected]:opacity-100" />
          </Tab>
          <Tab className="relative flex items-center justify-center h-full rounded-none px-4 w-full text-[15px]/5 text-white focus:outline-none data-[hover]:bg-white/5 data-[focus]:outline-1 data-[focus]:outline-white group">
            <span className="font-medium text-gray group-data-[headlessui-state^=selected]:font-bold group-data-[headlessui-state^=selected]:text-white">
              Mentions
            </span>
            <div className="absolute bottom-0 w-[68px] rounded-full h-1 bg-primary opacity-0 group-data-[headlessui-state^=selected]:opacity-100" />
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            {!isPending && <div className="max-w-[598px]">{children}</div>}
            {isPending && (
              <div className="w-full h-full flex items-start justify-center mt-10">
                <LoadingSpinner />
              </div>
            )}
          </TabPanel>
          <TabPanel>
            {!isPending && <div className="max-w-[598px]">{children}</div>}
            {isPending && (
              <div className="w-full h-full flex items-start justify-center mt-10">
                <LoadingSpinner />
              </div>
            )}
          </TabPanel>
          <TabPanel>
            {!isPending && <div className="max-w-[598px]">{children}</div>}
            {isPending && (
              <div className="w-full h-full flex items-start justify-center mt-10">
                <LoadingSpinner />
              </div>
            )}
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
};

export default NotificationTabWrapper;
