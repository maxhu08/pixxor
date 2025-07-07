import { useCallback, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import useSWRInfinite from "swr/infinite";

interface UseInfiniteScrollOptions<T> {
  fetcher: (key: any) => Promise<T[]>;
  pageSize: number;
  rootMargin?: string;
  threshold?: number;
  revalidateFirstPage?: boolean;
  suspense?: boolean;
  getNextPageParam?: (lastPage: T[], allPages: T[][]) => any;
}

export function useInfiniteScroll<T>(baseKey: string, options: UseInfiniteScrollOptions<T>) {
  const {
    fetcher,
    pageSize,
    rootMargin = "100px",
    threshold = 0,
    revalidateFirstPage = true,
    suspense = false,
    getNextPageParam
  } = options;

  const getKey = useCallback(
    (pageIndex: number, previousPageData: T[] | null) => {
      if (previousPageData && previousPageData.length === 0) return null;

      if (getNextPageParam && pageIndex > 0 && previousPageData) {
        const nextParam = getNextPageParam(previousPageData, []);
        if (!nextParam) return null;
        return `${baseKey}:${JSON.stringify(nextParam)}`;
      }

      return `${baseKey}:${pageIndex}`;
    },
    [baseKey, getNextPageParam]
  );

  const { data, size, setSize, isLoading, isValidating, error, mutate } = useSWRInfinite(
    getKey,
    fetcher,
    {
      revalidateFirstPage,
      suspense
    }
  );

  const items = data ? data.flat() : [];
  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.length < pageSize);
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");

  const { ref: loadMoreRef, inView } = useInView({
    threshold,
    rootMargin
  });

  useEffect(() => {
    if (inView && !isLoadingMore && !isReachingEnd && !error) {
      setSize((prev) => prev + 1);
    }
  }, [inView, isLoadingMore, isReachingEnd, setSize, error]);

  return {
    data: items,
    isLoading,
    isLoadingMore,
    isValidating,
    isEmpty,
    isReachingEnd,
    error,
    size,
    setSize,
    mutate,
    loadMoreRef
  };
}
