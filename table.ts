import {
  CreateConfig,
  DeleteConfig,
  FindConfig,
  UpdateConfig,
} from "./types/queryConfig";

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

  static generateInsertClause<Data extends Record<string, unknown>>(
    data: Data
  ) {
    if (Object.keys(data).length === 0) return "";

    let insertString = "(";

    Object.keys(data).forEach((field, index, array) => {
      insertString += `${field}${
        index < array.length - 1 ? ", " : ") VALUES ("
      }`;
    });

    Object.values(data).forEach((value, index, array) => {
      insertString += `${value}${index < array.length - 1 ? ", " : ")"}`;
    });

    return insertString;
  }

  static generateSetClause<Data extends Record<string, unknown>>(data: Data) {
    let setString = "SET ";

    Object.entries(data).forEach(([field, value], index, array) => {
      setString += `${field} = ${value}${index < array.length - 1 ? ", " : ""}`;
    });

    return setString;
  }
}

export class Table<
  T extends Record<string, unknown> = Record<string, unknown>
> {
  constructor(private tableName: string) {}

  public find(findConfig?: FindConfig<T>) {
    const selectClause = SQLWriter.generateSelectClause(findConfig?.select);
    const whereClause = SQLWriter.generateWhereClause(findConfig?.where);
    const orderByClause = SQLWriter.generateOrderByClause(findConfig?.orderBy);
    const limitClause = SQLWriter.generateLimitClause(findConfig?.limit);
    const offsetClause = SQLWriter.generateOffsetClause(findConfig?.offset);

    return `${selectClause} FROM ${this.tableName} ${whereClause} ${orderByClause} ${limitClause} ${offsetClause}`.trim();
  }

  public create(createConfig: CreateConfig<T>) {
    const insertClause = SQLWriter.generateInsertClause(createConfig.data);

    return `INSERT INTO ${this.tableName} ${insertClause}`.trim();
  }

  public update(updateConfig: UpdateConfig<T>) {
    const setClause = SQLWriter.generateSetClause(updateConfig.data);
    const whereClause = SQLWriter.generateWhereClause(updateConfig.where);

    return `UPDATE ${this.tableName} ${setClause} ${whereClause}`.trim();
  }

  public delete(deleteConfig: DeleteConfig<T>) {
    const whereClause = SQLWriter.generateWhereClause(deleteConfig.where);

    return `DELETE FROM ${this.tableName} ${whereClause}`.trim();
  }
}
