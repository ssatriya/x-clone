import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import useSWRInfinite from "swr/infinite";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useInfiniteScroll = () => {
  const { data, mutate, size, setSize, isValidating, isLoading } =
    useSWRInfinite(
      (index) =>
        `/api/post?limit=${INFINITE_SCROLLING_PAGINATION_RESULTS}&page=${
          index + 1
        }`,
      fetcher
    );

  return {
    data,
    mutate,
    size,
    setSize,
    isValidating,
    isLoading,
  };
};
