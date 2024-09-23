import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

let connection: postgres.Sql;
const connectionString = process.env.DATABASE_URL!;

if (process.env.NODE_ENV === "production") {
  connection = postgres(connectionString, { prepare: false });
} else {
  const globalConnection = global as typeof globalThis & {
    connection: postgres.Sql;
  };
  if (!globalConnection.connection) {
    globalConnection.connection = postgres(connectionString, {
      prepare: false,
    });
  }
  connection = globalConnection.connection;
}

const db = drizzle(connection, { schema });

export default db;
