import { RawSchema } from "./raw";

type ForeignKeyFieldData = {
  tableName: string;
  fieldName: string;
  reference: {
    tableName: string;
    fieldName: string;
  };
  onDelete?: string;
  onUpdate?: string;
};

type UniqueFieldData = {
  tableName: string;
  fieldName: string;
};

export class SQLMigrationWriter {
  static generateCreateTableClause(schema: RawSchema) {
    let createTableString = "";
    const foreignKeyFields: ForeignKeyFieldData[] = [];
    const uniqueFields: UniqueFieldData[] = [];

    Object.entries(schema).forEach(([tableName, fields]) => {
      let primaryKeyField: { tableName: string; fieldName: string } | undefined;
      createTableString += `CREATE TABLE "${tableName}"(`;

      Object.entries(fields).forEach(([fieldName, value], index, array) => {
        const isSimpleValue = typeof value === "string";

        if (isSimpleValue) {
          createTableString += `"${fieldName}" ${value} NOT NULL${
            index < array.length - 1 ? ", " : ""
          }`;
        } else {
          if (value.foreignKeyOptions) {
            foreignKeyFields.push({
              fieldName,
              tableName,
              reference: {
                fieldName: value.foreignKeyOptions.fieldReference,
                tableName: value.foreignKeyOptions.tableReference,
              },
              onDelete: value.foreignKeyOptions.onDelete,
              onUpdate: value.foreignKeyOptions.onUpdate,
            });
          }

          if (value.primaryKey) {
            primaryKeyField = { fieldName, tableName };
          }

          if (value.unique) {
            uniqueFields.push({
              fieldName,
              tableName,
            });
          }

          createTableString += `"${fieldName}" ${value.type}${
            value.nullable ? "" : " NOT NULL"
          }${value.defaultValue ? ` DEFAULT ${value.defaultValue}` : ""}${
            index < array.length - 1 ? ", " : ""
          }`;
        }
      });

      if (primaryKeyField) {
        createTableString += `, CONSTRAINT "${primaryKeyField.tableName}_PK" PRIMARY KEY ("${primaryKeyField.fieldName}")`;
      }
      createTableString += ");";
    });

    foreignKeyFields.forEach((field) => {
      const foreignKeyConstraint = `${field.tableName}_${field.fieldName}_FK`;

      createTableString += `ALTER TABLE "${
        field.tableName
      }" ADD CONSTRAINT "${foreignKeyConstraint}" FOREIGN KEY ("${
        field.fieldName
      }") REFERENCES "${field.reference.tableName}"("${
        field.reference.fieldName
      }")${field.onDelete ? ` ON DELETE ${field.onDelete}` : ""}${
        field.onUpdate ? ` ON UPDATE ${field.onUpdate}` : ""
      };`;
    });

    uniqueFields.forEach((field) => {
      const uniqueFieldConstraint = `${field.tableName}_${field.fieldName}_key`;

      createTableString += `CREATE UNIQUE INDEX "${uniqueFieldConstraint}" ON "${field.tableName}"("${field.fieldName}");`;
    });

    return createTableString;
  }

  static generateDropTableClause(schema: RawSchema) {
    let dropTableString = "DROP TABLE IF EXISTS ";

    Object.entries(schema).forEach(([tableName], index, array) => {
      dropTableString += `"${tableName}"${
        index < array.length - 1 ? ", " : ""
      }`;
    });

    dropTableString += " CASCADE;";

    return dropTableString;
  }
}
