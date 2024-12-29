import { SQLQueryWriter } from "./sql-query-writer";
import {
  CreateConfig,
  DeleteConfig,
  FindConfig,
  UpdateConfig,
} from "./types/queryConfig";

export class Table<
  T extends Record<string, unknown> = Record<string, unknown>
> {
  constructor(private tableName: string) {}

  public find(findConfig?: FindConfig<T>) {
    const selectClause = SQLQueryWriter.generateSelectClause(
      findConfig?.select
    );
    const whereClause = SQLQueryWriter.generateWhereClause(findConfig?.where);
    const orderByClause = SQLQueryWriter.generateOrderByClause(
      findConfig?.orderBy
    );
    const limitClause = SQLQueryWriter.generateLimitClause(findConfig?.limit);
    const offsetClause = SQLQueryWriter.generateOffsetClause(
      findConfig?.offset
    );

    return `${selectClause} FROM "${this.tableName}" ${whereClause} ${orderByClause} ${limitClause} ${offsetClause}`.trim();
  }

  public create(createConfig: CreateConfig<T>) {
    const insertClause = SQLQueryWriter.generateInsertClause(createConfig.data);

    return `INSERT INTO "${this.tableName}" ${insertClause}`.trim();
  }

  public update(updateConfig: UpdateConfig<T>) {
    const setClause = SQLQueryWriter.generateSetClause(updateConfig.data);
    const whereClause = SQLQueryWriter.generateWhereClause(updateConfig.where);

    return `UPDATE "${this.tableName}" ${setClause} ${whereClause}`.trim();
  }

  public delete(deleteConfig: DeleteConfig<T>) {
    const whereClause = SQLQueryWriter.generateWhereClause(deleteConfig.where);

    return `DELETE FROM "${this.tableName}" ${whereClause}`.trim();
  }
}
