export type DBMS = "PostgreSQL";

export type DriverConfig = {
  user: string;
  host: string;
  database: string;
  password: string;
  port: number;
};

export type RunQueryFunction = <
  QueryResult extends Record<string, unknown> = Record<string, unknown>
>(
  query: string
) => Promise<QueryResult[]>;

export type RunMigrationFunction = (filename: string) => Promise<void>;

export abstract class Driver {
  protected abstract _client: unknown | undefined;
  abstract init(config: DriverConfig): Promise<void>;
  abstract runQuery: RunQueryFunction;
  abstract runMigration: RunMigrationFunction;
}
