import { RawSchema } from "./raw";
import { Schema } from "./schema";

export class Migrator<RunMigrationType extends (arg: string) => Promise<void>> {
  private _schema = new Schema();

  constructor(private _runMigration: RunMigrationType) {}

  public defineSchema(schema: RawSchema) {
    this._schema.define(schema);
  }

  public async migrate() {
    const schema = this._schema.get();
    if (Object.keys(schema).length === 0)
      throw new Error("No schema was provided.");

    await this._schema.migrate(this._runMigration);

    process.exit(0);
  }
}
