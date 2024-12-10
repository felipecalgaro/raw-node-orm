import { QueryConfig, Select, Where } from "./types/queryConfig";

export class Table {
  constructor(private tableName: string) {}

  private _generateSelectClause(select: Select | undefined) {
    if (!select || Object.keys(select).length === 0) return "SELECT *";

    let selectString = "SELECT ";

    Object.entries(select).forEach(([field, value], index, array) => {
      selectString += `${value ? `${field}` : ""}${
        array[index + 1]?.[1] ? ", " : ""
      }`;
    });

    return selectString;
  }

  private _generateWhereClause(where: Where | undefined) {
    if (!where || Object.keys(where).length === 0) return "";

    let whereString = "WHERE ";

    Object.entries(where).forEach(([field, value], index, array) => {
      whereString += `${field} = ${value}${
        index < array.length - 1 ? " AND " : ""
      }`;
    });

    return whereString;
  }

  public find(queryConfig?: QueryConfig) {
    const selectClause = this._generateSelectClause(queryConfig?.select);
    const whereClause = this._generateWhereClause(queryConfig?.where);

    return `${selectClause} FROM ${this.tableName} ${whereClause}`.trim();
  }
}
