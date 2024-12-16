import fs from "node:fs";
import { RawSchema } from "./raw";
import { DatabaseTypes, TYPES_MAPPER } from "./mapper";

type FieldOptions =
  | {
      defaultValue?: string | number | Date;
      type: DatabaseTypes;
      foreignKey: true;
      reference: `${string}.${string}`;
    }
  | {
      primaryKey?: boolean;
      defaultValue?: string | number | Date;
      type: DatabaseTypes;
      foreignKey?: false;
    };

export class Schema {
  static generate(schema: RawSchema) {
    const stream = fs.createWriteStream("generated/schema.ts");
    stream.once("open", () => {
      Object.entries(schema).forEach(([tableName, columns], index, array) => {
        stream.write(
          `export type ${`${tableName.charAt(0).toUpperCase()}${tableName.slice(
            1
          )}Schema`} = {\n`
        );
        Object.entries(columns).forEach(([field, type]) => {
          stream.write(`  ${field}: ${TYPES_MAPPER[type]}\n`);
        });
        stream.write("}\n");
        if (index < array.length - 1) stream.write("\n");
      });
      stream.end();
    });
  }
}
