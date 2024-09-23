import { Progress } from "@nextui-org/react";

const Progressbar = ({
  overallProgress,
  isPending,
  classNames,
  hasFiles,
}: {
  overallProgress: number;
  isPending: boolean;
  classNames: string;
  hasFiles: boolean;
}) => {
  const computedProgress = isPending
    ? overallProgress > 0
      ? overallProgress
      : 10
    : 100;
  return (
    <Progress
      size="sm"
      aria-label="Posting..."
      value={computedProgress}
      radius="none"
      classNames={{ track: "bg-transparent" }}
      className={classNames}
    />
  );
};

export default Progressbar;
