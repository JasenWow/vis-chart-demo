import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const chartCreateSchema = z.object({
  type: z.string(),
  data: z.array(z.any()),
  sessionId: z.string(),
});

const app = new Hono().post(
  "/createOne",
  zValidator("json", chartCreateSchema),
  async (c) => {
    const data = c.req.valid("json");
    console.log(data);
    const res = {
      success: true,
      resultObj: `http://localhost:8787/charts?id=${data.sessionId}`,
      errorMessage: "",
    };
    console.log("========");
    console.log(res);
    return c.json(res);
  }
);

export default app;
