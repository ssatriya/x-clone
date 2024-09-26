"use client";

import Search from "./search";
import UserItem from "./user-item";
import TrendItem from "./trend-item";

const RightSidebar = () => {
  return (
    <aside className="ml-8 w-[288px] min-[1111px]:w-[348px] hidden min-[1043px]:flex flex-col lg:mr-6">
      <div className="w-full space-y-4 bottom-20">
        <div className="fixed w-auto top-0 z-40 space-y-4 min-w-[288px] min-[1111px]:min-w-[348px]">
          <Search />
          <div className="border w-full rounded-2xl py-3">
            <div className="flex flex-col gap-[10px]">
              <p className="px-4 text-xl font-bold">Who to follow</p>
              <div>
                <UserItem />
                <UserItem />
              </div>
            </div>
          </div>
          <div className="border w-full rounded-2xl py-3">
            <div className="flex flex-col gap-[10px]">
              <p className="px-4 text-xl font-bold">Trends for you</p>
              <div>
                <TrendItem />
                <TrendItem />
                <TrendItem />
                <TrendItem />
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
