import { SQLQueryWriter } from "./sql-query-writer";
import { RunQueryFunction } from "./types/driver";
import {
  By,
  CountConfig,
  CountReturn,
  CreateConfig,
  DeleteConfig,
  FindConfig,
  FindReturn,
  UpdateConfig,
} from "./types/query-config";

export type RelationsMapper = {
  tableName: string;
  fieldName: string;
  tableReference: string;
  fieldReference: string;
}[];

export class Table<
  TableType extends Record<string, unknown> = Record<string, unknown>,
  RelationsType extends Record<string, Record<string, unknown>> = Record<
    string,
    Record<string, unknown>
  >
> {
  constructor(
    private _tableName: string,
    private _relationsMapper: RelationsMapper | undefined,
    private _runQuery: RunQueryFunction
  ) {}

  public async find<Config extends FindConfig<TableType, RelationsType>>(
    findConfig?: Config
  ) {
    if (
      findConfig?.include &&
      (!this._relationsMapper || this._relationsMapper.length === 0)
    ) {
      throw new Error(`Please provide data about the table's relationships.`);
    }

    const selectClause = findConfig?.include
      ? SQLQueryWriter.generateSelectWithJoinClause(
          findConfig.select,
          findConfig.include,
          this._tableName,
          this._relationsMapper!
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

    const query =
      `${selectClause} ${whereClause} ${orderByClause} ${limitClause} ${offsetClause}`.trim() +
      ";";

    return await this._runQuery<
      FindReturn<
        TableType,
        RelationsType,
        Config["select"] extends Record<string, unknown>
          ? Config["select"]
          : undefined,
        Config["include"] extends Record<string, unknown>
          ? Config["include"]
          : undefined
      >
    >(query);
  }

  public async create(createConfig: CreateConfig<TableType>) {
    const insertClause = SQLQueryWriter.generateInsertClause(createConfig.data);

    const query =
      `INSERT INTO "${this._tableName}"${insertClause}`.trim() + ";";

    return await this._runQuery(query);
  }

  public async update(updateConfig: UpdateConfig<TableType>) {
    const setClause = SQLQueryWriter.generateSetClause(updateConfig.data);
    const whereClause = SQLQueryWriter.generateWhereClause(updateConfig.where);

    const query =
      `UPDATE "${this._tableName}" ${setClause} ${whereClause}`.trim() + ";";

    return await this._runQuery(query);
  }

  public async delete(deleteConfig?: DeleteConfig<TableType>) {
    const whereClause = SQLQueryWriter.generateWhereClause(deleteConfig?.where);

    const query =
      `DELETE FROM "${this._tableName}" ${whereClause}`.trim() + ";";

    return await this._runQuery(query);
  }

  public async count(countConfig?: CountConfig<TableType>) {
    const countClause = SQLQueryWriter.generateCountClause(
      countConfig?.by as By<Record<string, unknown>> | undefined
    );
    const whereClause = SQLQueryWriter.generateWhereClause(countConfig?.where);

    const query =
      `${countClause} FROM "${this._tableName}" ${whereClause}`.trim() + ";";

    return await this._runQuery<CountReturn>(query);
  }
}
