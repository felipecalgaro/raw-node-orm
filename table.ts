import { SQLQueryWriter } from "./sql-query-writer";
import {
  CreateConfig,
  DeleteConfig,
  FindConfig,
  UpdateConfig,
} from "./types/query-config";

export type RelationsMapper = {
  tableName: string;
  fieldName: string;
  tableReference: string;
  fieldReference: string;
}[];

export class Table<
  Table extends Record<string, unknown> = Record<string, unknown>,
  TableRelations extends Record<string, Record<string, unknown>> = Record<
    string,
    Record<string, unknown>
  >
> {
  constructor(
    private _tableName: string,
    private _relationsMapped?: RelationsMapper
  ) {}

  public find(findConfig?: FindConfig<Table, TableRelations>) {
    if (
      findConfig?.include &&
      (!this._relationsMapped || this._relationsMapped.length === 0)
    ) {
      throw new Error(`Please provide data about the table's relationships.`);
    }

    const selectClause = findConfig?.include
      ? SQLQueryWriter.generateSelectWithJoinClause(
          findConfig.select,
          findConfig.include,
          this._tableName,
          this._relationsMapped!
        )
      : SQLQueryWriter.generateSelectWithoutJoinClause(
          findConfig?.select,
          this._tableName
        );
    const whereClause = SQLQueryWriter.generateWhereClause(findConfig?.where);
    const orderByClause = SQLQueryWriter.generateOrderByClause(
      findConfig?.orderBy
    );
    const limitClause = SQLQueryWriter.generateLimitClause(findConfig?.limit);
    const offsetClause = SQLQueryWriter.generateOffsetClause(
      findConfig?.offset
    );

    return (
      `${selectClause} ${whereClause} ${orderByClause} ${limitClause} ${offsetClause}`.trim() +
      ";"
    );
  }

  public create(createConfig: CreateConfig<Table>) {
    const insertClause = SQLQueryWriter.generateInsertClause(createConfig.data);

    return `INSERT INTO "${this._tableName}"${insertClause}`.trim() + ";";
  }

  public update(updateConfig: UpdateConfig<Table>) {
    const setClause = SQLQueryWriter.generateSetClause(updateConfig.data);
    const whereClause = SQLQueryWriter.generateWhereClause(updateConfig.where);

    return (
      `UPDATE "${this._tableName}" ${setClause} ${whereClause}`.trim() + ";"
    );
  }

  public delete(deleteConfig: DeleteConfig<Table>) {
    const whereClause = SQLQueryWriter.generateWhereClause(deleteConfig.where);

    return `DELETE FROM "${this._tableName}" ${whereClause}`.trim() + ";";
  }
}
