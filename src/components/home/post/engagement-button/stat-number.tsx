import { AnimatePresence, motion } from "framer-motion";

import { cn, getStatsMove } from "@/lib/utils";

type Props = {
  movePixel: number;
  count: number;
  isVisible: boolean;
  classNames?: string;
};

const StatNumber = ({ movePixel, count, isVisible, classNames }: Props) => {
  return (
    <div className="overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        {isVisible && (
          <motion.p
            {...getStatsMove(movePixel)}
            key={count}
            className={cn(
              classNames,
              "text-[13px] leading-4 tabular-nums px-1 relative -left-1"
            )}
          >
            {count}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StatNumber;
