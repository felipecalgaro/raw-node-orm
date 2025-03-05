import { Pool } from "pg";

export type DBMS = "PostgreSQL";

export type DriverConfig = {
  user: string;
  host: string;
  database: string;
  password: string;
  port: number;
  max?: number;
  idleTimeoutMillis?: number;
};

export type RunQueryFunction = <
  QueryResult extends Record<string, unknown>,
  FinalResult extends
    | Record<string, unknown>
    | Record<string, unknown>[]
    | void = QueryResult[]
>(
  query: string,
  formatResult: (result: QueryResult[]) => FinalResult
) => Promise<FinalResult>;

export type RunMigrationFunction = (filename: string) => Promise<void>;

export abstract class Driver {
  protected _pool: Pool;
  constructor(config: DriverConfig) {
    this._pool = new Pool({
      user: config.user,
      host: config.host,
      database: config.database,
      password: config.password,
      port: config.port,
      max: config.max ?? 10,
      idleTimeoutMillis: config.idleTimeoutMillis ?? 30000,
    });
  }
  abstract runQuery: RunQueryFunction;
  abstract runMigration: RunMigrationFunction;
}
