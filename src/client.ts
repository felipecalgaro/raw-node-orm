import { RelationsMapper, Table } from "./table";
import { DisconnectFunction, RunQueryFunction } from "./types/driver";

export class Client {
  constructor(
    private _runQuery: RunQueryFunction,
    private _disconnectPool: DisconnectFunction
  ) {}

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

  public async disconnect() {
    await this._disconnectPool();
  }
}
