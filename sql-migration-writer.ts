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

export class SQLMigrationWriter {
  static generateCreateTableClause(schema: RawSchema) {
    let createTableString = "";
    let foreignKeyFields: ForeignKeyFieldData[] = [];

    Object.entries(schema).forEach(([tableName, fields]) => {
      let primaryKeyField: { tableName: string; fieldName: string } | undefined;
      createTableString += `CREATE TABLE "${tableName}"(`;

      Object.entries(fields).forEach(([field, value], index, array) => {
        const isSimpleValue = typeof value === "string";

        if (isSimpleValue) {
          createTableString += `"${field}" ${value} NOT NULL${
            index < array.length - 1 ? ", " : ""
          }`;
        } else {
          if (value.foreignKey) {
            foreignKeyFields.push({
              fieldName: field,
              tableName,
              reference: value.reference!,
              onDelete: value.onDelete,
              onUpdate: value.onUpdate,
            });
          } else if (value.primaryKey) {
            primaryKeyField = { fieldName: field, tableName };
          }

          createTableString += `"${field}" ${value.type}${
            value.nullable ? "" : " NOT NULL"
          }${value.defaultValue ? ` DEFAULT ${value.defaultValue}` : ""}${
            index < array.length - 1 ? ", " : ""
          }`;
        }
      });

      if (primaryKeyField) {
        createTableString += `, CONSTRAINT "${primaryKeyField.tableName}_PK" PRIMARY KEY ("${primaryKeyField.fieldName}")`;
      }
      createTableString += "); ";
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
      }; `;
    });

    return createTableString;
  }

  static generateDropTableClause(tables: string[]) {
    let dropTableString = "DROP TABLE IF EXISTS ";

    tables.forEach((table, index, array) => {
      dropTableString += `"${table}"${index < array.length - 1 ? ", " : ""}`;
    });

    dropTableString += " CASCADE;";

    return dropTableString;
  }
}
