import { RawSchema } from "./raw";
import FileGenerator from "./file-generator";
import { FieldOptions } from "./types/field-value";

export class Schema {
  constructor(private _schema: RawSchema = {}) {}

  private _validateSchema(schema: RawSchema) {
    const tableNames = Object.keys(schema);

    const fieldsWithForeignKey = Object.values(schema)
      .map((tableFields) =>
        Object.values(tableFields).filter(
          (fieldValue) =>
            typeof fieldValue !== "string" && fieldValue.foreignKeyOptions
        )
      )
      .flat() as Required<Pick<FieldOptions, "foreignKeyOptions">>[];

    fieldsWithForeignKey.forEach((field) => {
      if (!tableNames.includes(field.foreignKeyOptions.tableReference)) {
        throw new Error(
          `Could not find table '${field.foreignKeyOptions.tableReference}' to reference to.`
        );
      }

      if (
        !schema[field.foreignKeyOptions.tableReference]?.[
          field.foreignKeyOptions.fieldReference
        ]
      ) {
        throw new Error(
          `Could not find field '${field.foreignKeyOptions.fieldReference}' in table '${field.foreignKeyOptions.tableReference}' to reference to.`
        );
      }
    });
  }

  public define(schema: RawSchema) {
    const newSchema = Object.assign(this._schema, schema);

    this._validateSchema(newSchema);

    this._schema = newSchema;
  }

  public get() {
    return this._schema;
  }

  public async migrate(runMigration: (filename: string) => Promise<void>) {
    const fileGenerator = new FileGenerator(this._schema);

    const migrationFilename = String(Date.now());

    fileGenerator.generateSQLFile(migrationFilename);

    await runMigration(migrationFilename);
    console.log("🎉 Migration successfully applied!");

    fileGenerator.generateTypesFile();
    fileGenerator.generateRelationsMapperFile();
    console.log("🎉 Types and mappers files successfully generated!");
  }
}
