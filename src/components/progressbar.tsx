import { useEffect, useState } from "react";
import ProgressBar from "@ramonak/react-progress-bar";

import { cn } from "@/lib/utils";

const Progressbar = ({ classNames }: { classNames: string }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        const newProgress = oldProgress + 20;
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <ProgressBar
      completed={progress}
      maxCompleted={100}
      className={cn(classNames)}
      height="4px"
      isLabelVisible={false}
      barContainerClassName="bg-transparent"
      bgColor="#1D9BF0"
    />
  );
};

export default Progressbar;
