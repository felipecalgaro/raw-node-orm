import { RawSchema } from "./raw";
import { OrderBy, Select, Where } from "./types/queryConfig";

export class SQLWriter {
  static generateSelectClause(
    select: Select<Record<string, unknown>> | undefined
  ) {
    if (!select || Object.keys(select).length === 0) return "SELECT *";

    let selectString = "SELECT ";

    Object.entries(select).forEach(([field, value], index, array) => {
      selectString += `${value ? `"${field}"` : ""}${
        array[index + 1]?.[1] ? ", " : ""
      }`;
    });

    return selectString;
  }

  static generateWhereClause(
    where: Where<Record<string, unknown>> | undefined
  ) {
    if (!where || Object.keys(where).length === 0) return "";

    let whereString = "WHERE ";

    Object.entries(where).forEach(([field, value], index, array) => {
      whereString += `"${field}" = '${value}'${
        index < array.length - 1 ? " AND " : ""
      }`;
    });

    return whereString;
  }

  static generateOrderByClause(
    orderBy: OrderBy<Record<string, unknown>> | undefined
  ) {
    if (!orderBy || Object.keys(orderBy).length === 0) return "";

    let orderByString = "ORDER BY ";

    Object.entries(orderBy).forEach(([field, value], index, array) => {
      orderByString += `"${field}" ${value}${
        index < array.length - 1 ? ", " : ""
      }`;
    });

    return orderByString;
  }

  static generateLimitClause(limit: number | undefined) {
    if (!limit) return "";

    return `LIMIT ${limit}`;
  }

  static generateOffsetClause(offset: number | undefined) {
    if (!offset) return "";

    return `OFFSET ${offset}`;
  }

  static generateInsertClause(data: Record<string, unknown>) {
    if (Object.keys(data).length === 0) return "";

    let insertString = "(";

    Object.keys(data).forEach((field, index, array) => {
      insertString += `"${field}"${
        index < array.length - 1 ? ", " : ") VALUES ("
      }`;
    });

    Object.values(data).forEach((value, index, array) => {
      insertString += `'${value}'${index < array.length - 1 ? ", " : ")"}`;
    });

    return insertString;
  }

  static generateSetClause(data: Record<string, unknown>) {
    let setString = "SET ";

    Object.entries(data).forEach(([field, value], index, array) => {
      setString += `"${field}" = '${value}'${
        index < array.length - 1 ? ", " : ""
      }`;
    });

    return setString;
  }

  static generateCreateTableClause(schema: RawSchema) {
    let createTableString = "";

    Object.entries(schema).forEach(([tableName, columns]) => {
      createTableString += `CREATE TABLE "${tableName}" (`;

      Object.entries(columns).forEach(([field, value], index, array) => {
        createTableString += `"${field}" ${value}${
          index < array.length - 1 ? ", " : ""
        }`;
      });

      createTableString += "); ";
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
