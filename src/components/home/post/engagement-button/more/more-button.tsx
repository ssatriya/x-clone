import Icons from "@/components/icons";
import Button from "@/components/ui/button";

const MoreButton = () => {
  return (
    <div className="relative right-6 bottom-1">
      <Button
        aria-label="More"
        variant="ghost"
        size="icon"
        onClick={(e) => e.stopPropagation()}
        className="absolute hover:bg-primary/10 group focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring h-[34px] w-[34px]"
      >
        <Icons.more className="h-[18px] w-[18px] fill-gray group-hover:fill-primary group-focus-visible:fill-primary" />
      </Button>
    </div>
  );
};

export default MoreButton;
