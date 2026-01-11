import type { AppType } from "server";
import { hc } from "hono/client";

const client = hc<AppType>("http://localhost:8787/");

const useClient = () => {
  return client;
};

export default useClient;
