export type DBMS = "PostgreSQL";

export type DriverConfig = {
  user: string;
  host: string;
  database: string;
  password: string;
  port: number;
};

export abstract class Driver {
  protected abstract _client: unknown | undefined;
  abstract init(config: DriverConfig): Promise<void>;
  abstract runQuery(query: string): Promise<unknown>;
  abstract runMigration(filename: string): Promise<void>;
}
