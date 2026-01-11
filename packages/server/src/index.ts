import { Hono } from "hono";
import charts from "./routes/charts";

const app = new Hono();

const routes = app.route("/charts", charts);

export default {
  fetch: app.fetch,
};

export type AppType = typeof routes;
