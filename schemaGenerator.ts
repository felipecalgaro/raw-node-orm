import fs from "node:fs";
import { RawSchema } from "./raw";

export class SchemaGenerator {
  static generate(schema: RawSchema) {
    const stream = fs.createWriteStream("generated/schema.ts");
    stream.once("open", () => {
      Object.entries(schema).forEach(([tableName, columns], index, array) => {
        stream.write(
          `export type ${`${tableName.charAt(0).toUpperCase()}${tableName.slice(
            1
          )}Schema`} = {\n`
        );
        Object.entries(columns).forEach(([field, value]) => {
          stream.write(`  ${field}: ${value}\n`);
        });
        stream.write("}\n");
        if (index < array.length - 1) stream.write("\n");
      });
      stream.end();
    });
  }
}
