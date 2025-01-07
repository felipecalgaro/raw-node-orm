export type Where<Table extends Record<string, unknown>> = {
  [k in keyof Table]?: Table[k];
};

export type Select<Table extends Record<string, unknown>> = {
  [k in keyof Table]?: boolean;
};

export type OrderBy<Table extends Record<string, unknown>> = {
  [k in keyof Table]?: "ASC" | "DESC";
};

export type FindConfig<Table extends Record<string, unknown>> = {
  select?: Select<Table>;
  where?: Where<Table>;
  orderBy?: OrderBy<Table>;
  limit?: number;
  offset?: number;
};

export type CreateConfig<Table extends Record<string, unknown>> = {
  data: Table;
};

export type UpdateConfig<Table extends Record<string, unknown>> = {
  data: Partial<Table>;
  where?: Where<Table>;
};

export type DeleteConfig<Table extends Record<string, unknown>> = {
  where?: Where<Table>;
};
