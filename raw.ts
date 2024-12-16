import { SchemaGenerator } from "./schemaGenerator";
import { Table } from "./table";

export type RawSchema = {
  [schemaName: string]: {
    [field: string]: "string" | "number" | "Date" | "undefined";
  };
};

export class Raw {
  private _schema: RawSchema = {};

  public table<T extends Record<string, unknown> = Record<string, unknown>>(
    tableName: string
  ) {
    const table = Object.entries(this._schema).find(
      ([name, schema]) => name === tableName
    );
    if (!table) throw new Error("Cannot find table.");

    return new Table<T>(tableName);
  }

  public createSchema(schema: RawSchema) {
    this._schema = Object.assign(this._schema, schema);
  }

  public migrate() {
    SchemaGenerator.generate(this._schema);
    this._schema = {};
  }
}
