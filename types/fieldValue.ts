import { TYPES_MAPPER } from "../mapper";

export type DatabaseTypes = keyof typeof TYPES_MAPPER;

type EventTrigger =
  | "CASCADE"
  | "SET NULL"
  | "SET DEFAULT"
  | "NO ACTION"
  | "RESTRICT";

export type FieldOptions = {
  primaryKey?: boolean;
  defaultValue?: string | number | boolean;
  type: DatabaseTypes;
  foreignKey?: boolean;
  reference?: {
    tableName: string;
    fieldName: string;
  };
  onDelete?: EventTrigger;
  onUpdate?: EventTrigger;
  nullable?: boolean;
};
