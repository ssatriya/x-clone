import Icons from "@/components/icons";
import { Button } from "@/components/ui/button";

const TrendItem = () => {
  return (
    <div className="flex flex-col gap-0 hover:bg-secondary/5 py-3 px-4 cursor-pointer">
      <div className="flex items-baseline justify-between">
        <p className="text-[13px] text-gray">Trending in Indonesia</p>
        <div className="relative flex items-center justify-center group">
          <Button
            aria-label="More"
            variant="ghost"
            size="icon"
            onClick={(e) => e.stopPropagation()}
            className="absolute -right-2 hover:bg-primary/10 group focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring h-[37.5px] w-[37.5px]"
          >
            <Icons.more className="h-[18px] w-[18px] fill-gray group-hover:fill-primary group-focus-visible:fill-primary" />
          </Button>
        </div>
      </div>
      <div>
        <p className="font-bold">Hello World</p>
        <p className="text-[13px] text-gray">1,673 posts</p>
      </div>
    </div>
  );
};

export default TrendItem;
