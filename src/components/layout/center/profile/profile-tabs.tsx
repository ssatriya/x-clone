"use client";

import { Tab, Tabs } from "@nextui-org/react";

export default function ProfileTabs() {
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
        <Tab key="posts" title="Posts"></Tab>
        <Tab key="replies" title="Replies"></Tab>
        <Tab key="highlights" title="Highlights"></Tab>
        <Tab key="media" title="Media"></Tab>
        <Tab key="likes" title="Likes"></Tab>
      </Tabs>
    </div>
  );
}
