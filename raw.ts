import { DatabaseTypes } from "./mapper";
import { Schema } from "./schema";
import { SQLWriter } from "./sqlWriter";
import { Table } from "./table";

export type RawSchema = {
  [schemaName: string]: {
    [field: string]: DatabaseTypes;
  };
};

export class Raw {
  private _schema: RawSchema = {};

  public table<T extends Record<string, unknown> = Record<string, unknown>>(
    tableName: string
  ) {
    const table = Object.keys(this._schema).find((name) => name === tableName);
    if (!table) throw new Error("Cannot find table.");

    return new Table<T>(tableName);
  }

  public addSchema(schema: RawSchema) {
    this._schema = Object.assign(this._schema, schema);
  }

  public migrate() {
    if (Object.keys(this._schema).length === 0)
      throw new Error("No schema was provided.");

    Schema.generate(this._schema);

    const migrateSQLString = `${SQLWriter.generateDropTableClause(
      Object.keys(this._schema)
    ).trim()} ${SQLWriter.generateCreateTableClause(this._schema).trim()}`;

    this._schema = {};

    return migrateSQLString;
  }
}
