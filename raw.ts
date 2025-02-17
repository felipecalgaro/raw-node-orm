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

type Config = {
  DBMS: DBMS;
  connection: DriverConfig;
};

export default class Raw {
  private _runQuery: RunQueryFunction | undefined;
  private _runMigration: RunMigrationFunction | undefined;
  private _migrator = Migrator;
  private _client = Client;

  constructor(private _config: Config) {}

  private async _init() {
    switch (this._config.DBMS) {
      case "PostgreSQL":
        const driver = new PostgreSQLDriver();

        const { database, host, password, port, user } =
          this._config.connection;

        await driver.init({
          database,
          host,
          password,
          port,
          user,
        });

        this._runQuery = driver.runQuery;
        this._runMigration = driver.runMigration;
    }
  }

  public async Migrator() {
    if (!this._runMigration) {
      await this._init();
    }

    return new this._migrator(this._runMigration!);
  }

  public async Client() {
    if (!this._runQuery) {
      await this._init();
    }

    return new this._client(this._runQuery!);
  }
}
