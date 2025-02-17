import { RelationsMapper, Table } from "./table";
import { RunQueryFunction } from "./types/driver";

export class Client {
  constructor(private _runQuery: RunQueryFunction) {}

  public table<
    Table extends Record<string, unknown> = Record<string, unknown>,
    Relations extends Record<string, Record<string, unknown>> = Record<
      string,
      Record<string, unknown>
    >
  >(tableName: string, relations?: RelationsMapper) {
    return new Table<Table, Relations>(tableName, relations, this._runQuery);
  }
}
