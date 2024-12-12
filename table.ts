import { QueryConfig } from "./types/queryConfig";

class SQLWriter {
  static generateSelectClause<SelectOptions extends Record<string, unknown>>(
    select: SelectOptions | undefined
  ) {
    if (!select || Object.keys(select).length === 0) return "SELECT *";

    let selectString = "SELECT ";

    Object.entries(select).forEach(([field, value], index, array) => {
      selectString += `${value ? `${field}` : ""}${
        array[index + 1]?.[1] ? ", " : ""
      }`;
    });

    return selectString;
  }

  static generateWhereClause<WhereOptions extends Record<string, unknown>>(
    where: WhereOptions | undefined
  ) {
    if (!where || Object.keys(where).length === 0) return "";

    let whereString = "WHERE ";

    Object.entries(where).forEach(([field, value], index, array) => {
      whereString += `${field} = ${value}${
        index < array.length - 1 ? " AND " : ""
      }`;
    });

    return whereString;
  }

  static generateOrderByClause<OrderByOptions extends Record<string, unknown>>(
    orderBy: OrderByOptions | undefined
  ) {
    if (!orderBy || Object.keys(orderBy).length === 0) return "";

    let orderByString = "ORDER BY ";

    Object.entries(orderBy).forEach(([field, value], index, array) => {
      orderByString += `${field} ${value}${
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
}

export class Table<
  T extends Record<string, unknown> = Record<string, unknown>
> {
  constructor(private tableName: string) {}

  public find(queryConfig?: QueryConfig<T>) {
    const selectClause = SQLWriter.generateSelectClause(queryConfig?.select);
    const whereClause = SQLWriter.generateWhereClause(queryConfig?.where);
    const orderByClause = SQLWriter.generateOrderByClause(queryConfig?.orderBy);
    const limitClause = SQLWriter.generateLimitClause(queryConfig?.limit);
    const offsetClause = SQLWriter.generateOffsetClause(queryConfig?.offset);

    return `${selectClause} FROM ${this.tableName} ${whereClause} ${orderByClause} ${limitClause} ${offsetClause}`.trim();
  }
}
