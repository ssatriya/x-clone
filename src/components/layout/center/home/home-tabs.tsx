"use client";

import * as React from "react";
import { Tab, Tabs } from "@nextui-org/react";

import ForYouFeed from "./for-you-feed";
import { UserWithFollowersFollowing } from "@/types/db";
import PostFormEditor from "../post-form-editor";
import { ViewContext } from "@/store/viewContext";
import Header from "../header";
import { useRouter } from "next/navigation";
import ForceRefresh from "@/components/force-refresh";

type HomeTabsProps = {
  user: UserWithFollowersFollowing;
};

export default function HomeTabs({ user }: HomeTabsProps) {
  const [activeTab, setActiveTab] = React.useState("for-you");
  const [isFocus, setIsFocus] = React.useState<boolean>(false);

  const router = useRouter();

  const viewContext = React.useContext(ViewContext);

  const focusHandler = () => {
    setIsFocus(true);
  };

  const tabHandler = (label: string) => {
    setActiveTab(label);
  };
  return (
    <div className="flex w-full flex-col relative">
      <ForceRefresh />
      <div className="hidden md:flex md:fixed md:w-[599px] bg-black/90 z-40 border-r backdrop-blur-sm">
        <Header title="Home" />
      </div>
      <Tabs
        onSelectionChange={(key) => {
          if (key === "for-you") {
            viewContext.setView("for-you");
          } else {
            viewContext.setView("following");
          }
        }}
        aria-label="Options"
        variant="underlined"
        classNames={{
          base: "font-bold",
          tab: "h-[53px] w-full hover:bg-hover group",
          tabList:
            "bg-black/90 w-full rounded-none p-0 gap-0 border-b md:fixed w-full md:w-[599px] md:mt-[53px] z-40 dark:bg-black/90 backdrop-blur-sm md:border-r",
          cursor: "bg-blue",
          panel: "px-0 pb-0",
          tabContent: "transition-none text-text",
        }}
      >
        <Tab key="for-you" title="For you">
          <div className="md:mt-[6.4rem] md:w-[599px]">
            <PostFormEditor
              user={user}
              focusHandler={focusHandler}
              isFocus={isFocus}
            />
            <ForYouFeed user={user} />
          </div>
        </Tab>
        <Tab key="following" title="Following">
          <div className="md:mt-[6.4rem] md:w-[599px]">
            <PostFormEditor
              user={user}
              focusHandler={focusHandler}
              isFocus={isFocus}
            />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
