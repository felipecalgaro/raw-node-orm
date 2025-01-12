import fs from "node:fs";
import { RawSchema } from "./raw";
import { TYPES_MAPPER } from "./mapper";
import { SQLMigrationWriter } from "./sql-migration-writer";

export class FileGenerator {
  private _schema: RawSchema;

  private _generateDirectories() {
    if (!fs.existsSync("generated")) {
      fs.mkdirSync("generated");
    }

    if (!fs.existsSync("generated/types")) {
      fs.mkdirSync("generated/types");
    }

    if (!fs.existsSync("generated/migrations")) {
      fs.mkdirSync("generated/migrations");
    }
  }

  constructor(schema: RawSchema) {
    this._schema = schema;

    this._generateDirectories();
  }

  public generateTypesFile() {
    let fileContent = "";

    Object.entries(this._schema).forEach(
      ([tableName, columns], index, array) => {
        fileContent += `export type ${`${tableName
          .charAt(0)
          .toUpperCase()}${tableName.slice(1)}Data`} = {\n`;

        Object.entries(columns).forEach(([field, value]) => {
          if (typeof value == "string") {
            fileContent += `  ${field}: ${TYPES_MAPPER[value]}\n`;
          } else {
            fileContent += `  ${field}${value.nullable ? "?" : ""}: ${
              TYPES_MAPPER[value.type]
            }\n`;
          }
        });

        fileContent += "}\n";
        if (index < array.length - 1) fileContent += "\n";
      }
    );

    fs.writeFile("generated/types/schema.ts", fileContent, (err) => {
      if (err) throw err;
    });
  }

  public generateSQLFile() {
    const fileContent = SQLMigrationWriter.generateCreateTableClause(
      this._schema
    )
      .trim()
      .split(";")
      .join(";\n\n");

    fs.writeFile("generated/migrations/schema.sql", fileContent, (err) => {
      if (err) throw err;
    });
  }
}
