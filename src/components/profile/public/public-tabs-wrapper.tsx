"use client";

import { usePathname, useRouter } from "next/navigation";
import { PropsWithChildren, useEffect, useState, useTransition } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";

import { getInitialIndex } from "@/lib/utils";
import LoadingSpinner from "@/components/loading-spinner";

type Props = {
  username: string;
};

const routeIndexMap: Record<string, number> = {
  posts: 0,
  with_replies: 1,
  media: 2,
};

const PublicTabsWrapper = ({
  children,
  username,
}: PropsWithChildren<Props>) => {
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
  }, [router, pathname]);

  const onChangeHandler = (index: number) => {
    setSelectedIndex(index);

    const pathMap: Record<number, string> = {
      0: `/${username}`,
      1: `/${username}/with_replies`,
      2: `/${username}/media`,
    };

    const path = pathMap[index];
    if (path) {
      startTransition(() => {
        router.push(path);
      });
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="min-[700px]:w-[598px] w-full">
        <TabGroup
          className="h-[53px]"
          selectedIndex={selectedIndex}
          onChange={onChangeHandler}
        >
          <TabList className="h-full border-b rounded-none p-0 gap-0 w-full sm-plus:w-[598px] bg-black z-40 backdrop-blur-md justify-evenly flex items-center">
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
                Media
              </span>
              <div className="absolute bottom-0 w-[56px] rounded-full h-1 bg-primary opacity-0 group-data-[headlessui-state^=selected]:opacity-100" />
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              {!isPending && <div className="md:w-[599px]">{children}</div>}
              {isPending && (
                <div className="w-full h-full flex items-start justify-center mt-10">
                  <LoadingSpinner />
                </div>
              )}
            </TabPanel>
            <TabPanel>
              {!isPending && <div className="md:w-[599px]">{children}</div>}
              {isPending && (
                <div className="w-full h-full flex items-start justify-center mt-10">
                  <LoadingSpinner />
                </div>
              )}
            </TabPanel>
            <TabPanel>
              {!isPending && <div className="md:w-[599px]">{children}</div>}
              {isPending && (
                <div className="w-full h-full flex items-start justify-center mt-10">
                  <LoadingSpinner />
                </div>
              )}
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  );
};

export default PublicTabsWrapper;
