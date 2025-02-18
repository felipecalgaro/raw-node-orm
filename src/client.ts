import { RelationsMapper, Table } from "./table";
import { RunQueryFunction } from "./types/driver";

export class Client {
  constructor(private _runQuery: RunQueryFunction) {}

  public table<
    TableType extends Record<string, unknown> = Record<string, unknown>,
    RelationsType extends Record<string, Record<string, unknown>> = Record<
      string,
      Record<string, unknown>
    >
  >(tableName: string, relations?: RelationsMapper) {
    return new Table<TableType, RelationsType>(
      tableName,
      relations,
      this._runQuery
    );
  }
}
