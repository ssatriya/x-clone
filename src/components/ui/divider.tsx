import { cn } from "@/lib/utils";

type Props = {
  className: string;
  orientation?: "horizontal" | "vertical";
};

const Divider = ({ className, orientation = "horizontal" }: Props) => {
  return (
    <div
      className={cn(
        className,
        orientation === "horizontal" && "w-full",
        orientation === "vertical" && "h-full"
      )}
    />
  );
};

export default Divider;
