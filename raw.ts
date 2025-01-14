import { Schema } from "./schema";
import { Table } from "./table";
import { DatabaseTypes, FieldOptions } from "./types/field-value";

export type RawSchema = {
  [tableName: string]: {
    [field: string]: DatabaseTypes | FieldOptions;
  };
};

export default class Raw {
  static Migrator = class {
    private _schema = new Schema();

    public defineSchema(schema: RawSchema) {
      this._schema.define(schema);
    }

    public migrate() {
      const schema = this._schema.get();
      if (Object.keys(schema).length === 0)
        throw new Error("No schema was provided.");

      this._schema.migrate();

      console.log("🎉 Migration SQL code successfully generated.");
    }
  };

  static Client = class {
    private _tables: RawSchema = {};

    public table<T extends Record<string, unknown> = Record<string, unknown>>(
      tableName: string
    ) {
      const tableExists = Object.keys(this._tables).includes(tableName);
      if (!tableExists) throw new Error("Cannot find table.");

      return new Table<T>(tableName);
    }
  };
}
