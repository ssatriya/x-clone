"use client";

import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { Button } from "@nextui-org/react";

import SearchBox from "@/components/layout/right/search-box";
import TrendItem from "@/components/layout/right/trend-item";

export default function RightSidebar() {
  return (
    <aside className="pt-1 max-w-[348px] flex flex-col mr-6">
      <div className="space-y-6">
        <SearchBox />
        <Card>
          <CardBody>
            <div className="flex flex-col gap-[10px]">
              <p className="font-bold text-xl">Subscribe to Premium</p>
              <p className="font-bold text-[15px]">
                Subscribe to unlock new features and if eligible, receive a
                share of ads revenue.
              </p>
              <div>
                <Button className="text-[15px] rounded-full bg-blue font-bold hover:bg-blue/90">
                  Subscribe
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="px-0">
            <div className="flex flex-col gap-[10px]">
              <p className="font-bold text-xl px-5">Trends for you</p>
              <div>
                <TrendItem />
                <TrendItem />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </aside>
  );
}
