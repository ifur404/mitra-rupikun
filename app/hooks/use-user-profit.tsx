import { useCallback, useEffect, useState } from "react";

export default function useUserProfit(user_id: number, range: number[] = []) {
  const [sum, setSum] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const getData = useCallback(
    async (requestedRange: number[] = range, signal?: AbortSignal) => {
      if (!user_id) return;

      setIsLoading(true);

      try {
        const params = new URLSearchParams({
          key: user_id.toString(),
          type: "profit",
        });

        if (requestedRange.length >= 2) {
          params.append("start", requestedRange[0].toString());
          params.append("end", requestedRange[1].toString());
        }

        const response = await fetch(`/api/ledger/?${params.toString()}`, {
          signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch sum for user ${user_id}`);
        }

        const data = (await response.json()) as { sum: number };
        setSum(data?.sum ?? 0);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setSum(0);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [user_id, range]
  );

  useEffect(() => {
    const abortController = new AbortController();
    getData(undefined, abortController.signal);
    return () => abortController.abort();
  }, [getData]);

  return {
    sum,
    isLoading,
    getData,
  };
}