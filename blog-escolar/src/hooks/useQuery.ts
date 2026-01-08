import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type UseQueryOptions<T> = {
  queryKey?: unknown[];
  queryFn: () => Promise<T>;
  enabled?: boolean;
};

type UseQueryResult<T> = {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => Promise<T | null>;
};

export default function useQuery<T>({
  queryKey,
  queryFn,
  enabled = true,
}: UseQueryOptions<T>): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const isActiveRef = useRef(true);

  const serializedKey = useMemo(() => JSON.stringify(queryKey ?? []), [queryKey]);

  const runQuery = useCallback(async () => {
    if (!isActiveRef.current) {
      return null;
    }
    setIsLoading(true);
    setIsError(false);
    setError(null);
    let result: T | null = null;
    try {
      result = await queryFn();
      if (isActiveRef.current) {
        setData(result);
      }
    } catch (err) {
      if (isActiveRef.current) {
        setIsError(true);
        setError(err);
      }
    } finally {
      if (isActiveRef.current) {
        setIsLoading(false);
      }
    }
    return result;
  }, [queryFn]);

  useEffect(() => {
    isActiveRef.current = true;
    if (!enabled) {
      return () => {
        isActiveRef.current = false;
      };
    }
    const execute = async () => {
      if (!isActiveRef.current) return;
      await runQuery();
    };
    execute();
    return () => {
      isActiveRef.current = false;
    };
  }, [enabled, serializedKey, runQuery]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: runQuery,
  };
}
