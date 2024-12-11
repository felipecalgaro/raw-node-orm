export type Where<
  Table extends Record<string, string> = Record<string, string>
> = {
  [k in keyof Table]?: string;
};

export type Select<
  Table extends Record<string, string> = Record<string, string>
> = {
  [k in keyof Table]?: boolean;
};

export type OrderBy<
  Table extends Record<string, string> = Record<string, string>
> = {
  [k in keyof Table]?: "ASC" | "DESC";
};

export type QueryConfig = {
  select?: Select;
  where?: Where;
  orderBy?: OrderBy;
  limit?: number;
  offset?: number;
};
