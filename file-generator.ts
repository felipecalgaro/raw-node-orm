import fs from "node:fs";
import { RawSchema } from "./raw";
import { TYPES_MAPPER } from "./mapper";
import { SQLMigrationWriter } from "./sql-migration-writer";
import { RelationsMapper } from "./table";

export default class FileGenerator {
  private _schema: RawSchema;
  private _relationsMapper: RelationsMapper = [];

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

    if (!fs.existsSync("generated/mappers")) {
      fs.mkdirSync("generated/mappers");
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
        const tableType = `${tableName
          .charAt(0)
          .toUpperCase()}${tableName.slice(1)}`;
        fileContent += `export type ${tableType}Data = {\n`;

        const tablesReferenced: string[] = [];

        Object.entries(columns).forEach(([field, value]) => {
          if (typeof value == "string") {
            fileContent += `  "${field}": ${TYPES_MAPPER[value]}\n`;
          } else {
            fileContent += `  "${field}"${value.nullable ? "?" : ""}: ${
              TYPES_MAPPER[value.type]
            }\n`;

            if (value.foreignKeyOptions) {
              tablesReferenced.push(value.foreignKeyOptions.tableReference);
              this._relationsMapper.push({
                tableName,
                fieldName: field,
                fieldReference: value.foreignKeyOptions.fieldReference,
                tableReference: value.foreignKeyOptions.tableReference,
              });
            }
          }
        });

        if (tablesReferenced.length > 0) {
          fileContent += `}\n\nexport type ${tableType}Relations = {\n`;

          tablesReferenced.forEach((table) => {
            const referencedTableType = `${table
              .charAt(0)
              .toUpperCase()}${table.slice(1)}Data`;
            fileContent += `  "${table}"?: ${referencedTableType}\n`;
          });
        }

        fileContent += "}\n";

        if (index < array.length - 1) fileContent += "\n";
      }
    );

    fs.writeFile("generated/types/schema-data.ts", fileContent, (err) => {
      if (err) throw err;
    });
  }

  public generateSQLFile(filename: string) {
    const fileContent = SQLMigrationWriter.generateCreateTableClause(
      this._schema
    )
      .trim()
      .split(";")
      .join(";\n\n");

    fs.writeFileSync(`generated/migrations/${filename}.sql`, fileContent);
  }

  static generateSchemaDefinitionFile() {
    const pathToRaw = "./lib/raw";

    const fileContent = `import { raw } from "${pathToRaw}";\n\nraw.Migrator().then((migrator) => {\n  // Define your schema here\n  migrator.defineSchema({\n    User: {\n      name: {\n        type: "VARCHAR",\n        nullable: true\n      }\n    },\n    Post: {\n      title: "VARCHAR"\n    }\n  });\n\n  migrator.migrate();\n});`;

    fs.writeFile("schema-definition.ts", fileContent, (err) => {
      if (err) throw err;
      console.log(
        "🎉 Database schema is ready to be defined at ./schema-definition.ts."
      );
    });
  }

  public generateRelationsMapperFile() {
    if (this._relationsMapper.length === 0) {
      return;
    }

    const fileContent = this._relationsMapper.reduce(
      (
        acc,
        { fieldName, fieldReference, tableName, tableReference },
        index,
        array
      ) => {
        return (
          acc +
          `  {\n    tableName: "${tableName}",\n    fieldName: "${fieldName}",\n    fieldReference: "${fieldReference}",\n    tableReference: "${tableReference}",\n  },\n${
            index === array.length - 1 ? "] as const;" : ""
          }`
        );
      },
      "export const RELATIONS_MAPPER = [\n"
    );

    fs.writeFile("generated/mappers/relations.ts", fileContent, (err) => {
      if (err) throw err;
    });
  }
}
