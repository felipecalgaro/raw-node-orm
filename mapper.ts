export const TYPES_MAPPER = {
  VARCHAR: "string",
  FLOAT: "number",
  INT: "number",
  DATETIME: "Date",
} as const;

export type DatabaseTypes = keyof typeof TYPES_MAPPER;
