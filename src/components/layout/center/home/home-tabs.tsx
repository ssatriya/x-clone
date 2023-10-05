"use client";

import * as React from "react";
import { Tab, Tabs } from "@nextui-org/react";
import PostForm from "./post-form";

import ForYouFeed from "./for-you-feed";
import { User } from "@prisma/client";

type HomeTabsProps = {
  user: User;
};

export default function HomeTabs({ user }: HomeTabsProps) {
  const [activeTab, setActiveTab] = React.useState("for-you");
  const [isFocus, setIsFocus] = React.useState<boolean>(false);

  const focusHandler = () => {
    setIsFocus(true);
  };

  const tabHandler = (label: string) => {
    setActiveTab(label);
  };

  return (
    <div className="flex w-full flex-col">
      <Tabs
        aria-label="Options"
        variant="underlined"
        classNames={{
          base: "font-bold",
          tab: "h-[53px] w-full hover:bg-hover ",
          tabList: "bg-black w-full rounded-none p-0 gap-0 border-b",
          cursor: "bg-blue",
          panel: "px-0 pb-0",
        }}
      >
        <Tab key="for-you" title="For you">
          <PostForm user={user} focusHandler={focusHandler} isFocus={isFocus} />
          <ForYouFeed user={user} />
        </Tab>
        <Tab key="following" title="Following">
          <PostForm user={user} focusHandler={focusHandler} isFocus={isFocus} />
        </Tab>
      </Tabs>
    </div>
  );
}
