import fs from "node:fs";
import pg from "pg";
import { Driver, DriverConfig } from "../types/driver";

export class PostgreSQLDriver extends Driver {
  protected _client: pg.Client | undefined;

  public async init(config: DriverConfig) {
    try {
      this._client = new pg.Client({
        user: config.user,
        host: config.host,
        database: config.database,
        password: config.password,
        port: config.port,
      });

      await this._client.connect();
    } catch {
      throw new Error("Could not connect to database.");
    }
  }

  public runQuery = async <QueryResult extends Record<string, unknown>>(
    sql: string
  ) => {
    if (!this._client) {
      throw new Error("Provide a connection to a database first.");
    }

    const result = await this._client.query<QueryResult>(sql);

    return result.rows;
  };

  public runMigration = async (filename: string) => {
    const filePath = `./raw/generated/migrations/${filename}.sql`;

    const sql = fs.readFileSync(filePath, "utf8");

    if (!this._client) {
      throw new Error("Provide a connection to a database first.");
    }

    try {
      await this._client.query(sql);
    } catch {
      fs.unlinkSync(filePath);
      throw new Error("Could not apply migrations.");
    }
  };
}
