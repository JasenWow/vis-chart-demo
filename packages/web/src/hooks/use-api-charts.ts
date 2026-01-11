import type { AppType } from "server";
import { hc } from "hono/client";
import useSWR from "swr";
import type { InferRequestType } from "hono/client";
import { useState } from "react";

const client = hc<AppType>(`${import.meta.env.VITE_WEB_HOST}/api`);
const $post = client.charts.getAll.$post;
const fetcher = (arg: InferRequestType<typeof $post>) => async () => {
  const res = await $post(arg);
  return await res.json();
};

const useApiCharts = () => {
  const [ids, setIds] = useState<number[]>([]);

  const { data, error, isLoading, mutate } = useSWR(
    ["chart", ids],
    fetcher({
      json: {
        ids: ids,
      },
    })
  );

  return { data, error, isLoading, setIds, mutate };
};

export default useApiCharts;
