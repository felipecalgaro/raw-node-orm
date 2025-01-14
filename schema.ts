import { RawSchema } from "./raw";
import FileGenerator from "./file-generator";

export class Schema {
  constructor(private _schema: RawSchema = {}) {}

  public define(schema: RawSchema) {
    this._schema = Object.assign(this._schema, schema);
  }

  public get() {
    return this._schema;
  }

  public migrate() {
    const fileGenerator = new FileGenerator(this._schema);

    fileGenerator.generateSQLFile();
    fileGenerator.generateTypesFile();
  }
}
