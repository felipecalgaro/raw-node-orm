export type Where<Table extends Record<string, unknown>> = {
  [k in keyof Table]?: Table[k];
};

export type Select<Table extends Record<string, unknown>> = {
  [k in keyof Table]?: boolean;
};

export type OrderBy<Table extends Record<string, unknown>> = {
  [k in keyof Table]?: "ASC" | "DESC";
};

export type Include<Relations extends Record<string, Record<string, unknown>>> =
  {
    [k in keyof Relations]?: boolean | Select<Relations[k]>;
  };

export type By<Table extends Record<string, unknown>> =
  | {
      field: keyof Table;
      distinct?: boolean;
    }
  | keyof Table;

export type FindConfig<
  Table extends Record<string, unknown>,
  TableRelations extends Record<string, Record<string, unknown>>
> = {
  select?: Select<Table>;
  where?: Where<Table>;
  orderBy?: OrderBy<Table>;
  include?: Include<TableRelations>;
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

export type CountConfig<Table extends Record<string, unknown>> = {
  by?: By<Table>;
  where?: Where<Table>;
};
