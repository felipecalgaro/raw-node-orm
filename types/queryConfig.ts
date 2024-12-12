type Where<Table extends Record<string, unknown>> = {
  [k in keyof Table]?: Table[k];
};

type Select<Table extends Record<string, unknown>> = {
  [k in keyof Table]?: boolean;
};

type OrderBy<Table extends Record<string, unknown>> = {
  [k in keyof Table]?: "ASC" | "DESC";
};

export type QueryConfig<T extends Record<string, unknown>> = {
  select?: Select<T>;
  where?: Where<T>;
  orderBy?: OrderBy<T>;
  limit?: number;
  offset?: number;
};
