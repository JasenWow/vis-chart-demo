import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { chartsTable, sessionsTable } from "../db/schema";

const chartCreateSchema = z.object({
  type: z.string(),
  data: z.array(z.any()),
  sessionId: z.number(),
});

const app = new Hono()
  .post("/createOne", zValidator("json", chartCreateSchema), async (c) => {
    console.log(c.req.json());
    const data = c.req.valid("json");

    const exist = await db.query.sessionsTable.findFirst({
      where: () => eq(sessionsTable.id, data.sessionId),
    });

    let session = exist;

    if (!exist) {
      const [tmp] = await db.insert(sessionsTable).values({}).returning();

      session = tmp;
    }

    const [chart] = await db
      .insert(chartsTable)
      .values({
        data: JSON.stringify({
          type: data.type,
          data: data.data,
        }),
        sessionId: session!.id,
      })
      .returning();

    const res = {
      success: true,
      resultObj: `http://localhost:8787/charts?id=${chart!.id}`,
      errorMessage: "",
    };
    console.log("========");
    console.log(res);
    return c.json(res);
  })
  .get(
    "/getOne",
    zValidator("query", z.object({ id: z.string() })),
    async (c) => {
      const { id } = c.req.valid("query");

      const chart = await db.query.chartsTable.findFirst({
        where: () => eq(chartsTable.id, Number(id)),
      });

      if (!chart) {
        return c.json({ error: "Chart not found" }, 404);
      }

      const res = chart.data ? JSON.parse(chart.data) : null;

      return c.json(res);
    }
  );

export default app;
