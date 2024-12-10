import { Table } from "./table";

export class Raw {
  public table(tableName: string): Table {
    return new Table(tableName);
  }
}
