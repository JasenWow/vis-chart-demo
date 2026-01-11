import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const sessionsTable = sqliteTable("sessions", {
  id: int().primaryKey({ autoIncrement: true }),
  data: text(),
});

export const chartsTable = sqliteTable("charts", {
  id: int().primaryKey({ autoIncrement: true }),
  sessionId: int(),
  data: text(),
});
