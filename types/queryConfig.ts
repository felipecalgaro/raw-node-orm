type Where<Table extends Record<string, unknown>> = {
  [k in keyof Table]?: Table[k];
};

type Select<Table extends Record<string, unknown>> = {
  [k in keyof Table]?: boolean;
};

type OrderBy<Table extends Record<string, unknown>> = {
  [k in keyof Table]?: "ASC" | "DESC";
};

export type FindConfig<T extends Record<string, unknown>> = {
  select?: Select<T>;
  where?: Where<T>;
  orderBy?: OrderBy<T>;
  limit?: number;
  offset?: number;
};

export type CreateConfig<T extends Record<string, unknown>> = {
  data: T;
};

export type UpdateConfig<T extends Record<string, unknown>> = {
  data: Partial<T>;
  where?: Where<T>;
};

export type DeleteConfig<T extends Record<string, unknown>> = {
  where?: Where<T>;
};
