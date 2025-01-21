import { RelationsMapper } from "./table";
import { Include, OrderBy, Select, Where } from "./types/query-config";

function writeFieldsOfSelectClause(
  selectConfig: Select<Record<string, unknown>>,
  tableName?: string
) {
  return Object.entries(selectConfig).reduce(
    (acc, [field, value], index, array) => {
      return (
        acc +
        `${value ? `${tableName ? `"${tableName}".` : ""}"${field}"` : ""}${
          array[index + 1]?.[1] ? ", " : ""
        }`
      );
    },
    ""
  );
}

export class SQLQueryWriter {
  static generateSelectWithoutJoinClause(
    select: Select<Record<string, unknown>> | undefined,
    tableName: string
  ) {
    if (!select || Object.keys(select).length === 0)
      return `SELECT * FROM "${tableName}"`;

    return `SELECT ${writeFieldsOfSelectClause(select)} FROM "${tableName}"`;
  }

  static generateSelectWithJoinClause(
    select: Select<Record<string, unknown>> | undefined,
    include: Include<Record<string, Record<string, unknown>>>,
    tableName: string,
    relations: RelationsMapper
  ) {
    let selectString = "";

    if (!select || Object.keys(select).length === 0) {
      selectString += `SELECT "${tableName}".*`;
    } else {
      selectString += `SELECT ${writeFieldsOfSelectClause(select, tableName)}`;
    }

    Object.entries(include).forEach(([referencedTableName, value]) => {
      if (value) {
        if (typeof value === "boolean") {
          selectString += `, "${referencedTableName}".*`;
        } else if (Object.keys(value).length !== 0) {
          selectString += `, ${writeFieldsOfSelectClause(
            value,
            referencedTableName
          )}`;
        }
      }

      const relation = relations.find(
        (relation) =>
          relation.tableName === tableName &&
          relation.tableReference === referencedTableName
      );

      if (!relation) {
        throw new Error("Could not establish relationship between tables.");
      }

      selectString += ` FROM "${tableName}" LEFT JOIN "${referencedTableName}" ON "${tableName}"."${relation.fieldName}" = "${referencedTableName}"."${relation.fieldReference}"`;
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
}
