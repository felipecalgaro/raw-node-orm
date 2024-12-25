import { SQLWriter } from "./sqlWriter";
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
    const selectClause = SQLWriter.generateSelectClause(findConfig?.select);
    const whereClause = SQLWriter.generateWhereClause(findConfig?.where);
    const orderByClause = SQLWriter.generateOrderByClause(findConfig?.orderBy);
    const limitClause = SQLWriter.generateLimitClause(findConfig?.limit);
    const offsetClause = SQLWriter.generateOffsetClause(findConfig?.offset);

    return `${selectClause} FROM "${this.tableName}" ${whereClause} ${orderByClause} ${limitClause} ${offsetClause}`.trim();
  }

  public create(createConfig: CreateConfig<T>) {
    const insertClause = SQLWriter.generateInsertClause(createConfig.data);

    return `INSERT INTO "${this.tableName}" ${insertClause}`.trim();
  }

  public update(updateConfig: UpdateConfig<T>) {
    const setClause = SQLWriter.generateSetClause(updateConfig.data);
    const whereClause = SQLWriter.generateWhereClause(updateConfig.where);

    return `UPDATE "${this.tableName}" ${setClause} ${whereClause}`.trim();
  }

  public delete(deleteConfig: DeleteConfig<T>) {
    const whereClause = SQLWriter.generateWhereClause(deleteConfig.where);

    return `DELETE FROM "${this.tableName}" ${whereClause}`.trim();
  }
}
