import fs from "node:fs";
import { Driver, DriverConfig } from "../types/driver";
import { PoolClient } from "pg";

export class PostgreSQLDriver extends Driver {
  constructor(config: DriverConfig) {
    super(config);
  }

  public runQuery = async <
    QueryResult extends Record<string, unknown>,
    FinalResult extends
      | Record<string, unknown>
      | Record<string, unknown>[]
      | void
  >(
    sql: string,
    formatResult: (result: QueryResult[]) => FinalResult
  ) => {
    let client: PoolClient;
    try {
      client = await this._pool.connect();
    } catch {
      throw new Error("Error while connecting to the database.");
    }

    try {
      const result = await client.query<QueryResult>(sql);
      return formatResult(result.rows);
    } catch {
      throw new Error("Error while querying the database.");
    } finally {
      client.release();
    }
  };

  public runMigration = async (filename: string) => {
    const filePath = `./raw/generated/migrations/${filename}.sql`;

    const sql = fs.readFileSync(filePath, "utf8");

    let client: PoolClient;
    try {
      client = await this._pool.connect();
    } catch {
      throw new Error("Error while connecting to the database.");
    }

    try {
      await client.query(sql);
    } catch {
      fs.unlinkSync(filePath);
      throw new Error("Error while applying migrations to the database.");
    } finally {
      client.release();
    }
  };
}
