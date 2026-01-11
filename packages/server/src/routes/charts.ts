import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db";
import { eq, inArray } from "drizzle-orm";
import { chartsTable, sessionsTable } from "../db/schema";

const chartCreateSchema = z.object({
  type: z.string(),
  data: z.array(z.any()),
  sessionId: z.number(),
});

const app = new Hono()
  .post("/createOne", zValidator("json", chartCreateSchema), async (c) => {
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

    return c.json(res);
  })
  .post(
    "/getAll",
    zValidator("json", z.object({ ids: z.array(z.any()) })),
    async (c) => {
      const { ids } = c.req.valid("json");

      const charts = await db.query.chartsTable.findMany({
        where: () => inArray(chartsTable.id, ids),
      });

      const res = charts.map((i) => {
        return {
          ...JSON.parse(i.data!),
        };
      });
      return c.json(res);
    }
  )
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
