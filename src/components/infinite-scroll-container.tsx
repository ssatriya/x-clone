"use client";

import { useInView } from "react-intersection-observer";

interface Props extends React.PropsWithChildren {
  onBottomReached: () => void;
  classNames?: string;
}

const InfiniteScrollContainer = ({
  children,
  classNames,
  onBottomReached,
}: Props) => {
  const { ref } = useInView({
    rootMargin: "200px",
    onChange(inView) {
      if (inView) {
        onBottomReached();
      }
    },
  });

  return (
    <div className={classNames}>
      {children}
      <div ref={ref} />
    </div>
  );
};

export default InfiniteScrollContainer;
