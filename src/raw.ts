import { Client } from "./client";
import { PostgreSQLDriver } from "./drivers/postgresql";
import { Migrator } from "./migrator";
import {
  DBMS,
  Driver,
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
  private _driver: Driver;
  private _config: RawConfig;

  constructor(config: RawConfig) {
    this._config = config;

    const { database, host, password, port, user, idleTimeoutMillis, max } =
      config.connection;

    switch (this._config.DBMS) {
      case "PostgreSQL":
        this._driver = new PostgreSQLDriver({
          database,
          host,
          password,
          port,
          user,
          idleTimeoutMillis,
          max,
        });
    }
  }

  get Migrator() {
    return new Migrator(this._driver.runMigration);
  }

  get Client() {
    return new Client(this._driver.runQuery, this._driver.disconnect);
  }
}
