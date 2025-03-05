import { Client } from "./client";
import { PostgreSQLDriver } from "./drivers/postgresql";
import { Migrator } from "./migrator";
import {
  DBMS,
  DriverConfig,
  RunMigrationFunction,
  RunQueryFunction,
} from "./types/driver";
import { DatabaseTypes, FieldOptions } from "./types/field-value";

export type RawSchema = {
  [tableName: string]: {
    [field: string]: DatabaseTypes | FieldOptions;
  };
};

export type RawConfig = {
  DBMS: DBMS;
  connection: DriverConfig;
};

export class Raw {
  private _runQuery: RunQueryFunction;
  private _runMigration: RunMigrationFunction;
  private _config: RawConfig;

  constructor(config: RawConfig) {
    this._config = config;

    const { database, host, password, port, user, idleTimeoutMillis, max } =
      config.connection;

    switch (this._config.DBMS) {
      case "PostgreSQL":
        const driver = new PostgreSQLDriver({
          database,
          host,
          password,
          port,
          user,
          idleTimeoutMillis,
          max,
        });

        this._runQuery = driver.runQuery;
        this._runMigration = driver.runMigration;
    }
  }

  get Migrator() {
    return new Migrator(this._runMigration);
  }

  get Client() {
    return new Client(this._runQuery);
  }
}
