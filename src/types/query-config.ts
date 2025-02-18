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

export type FindReturn<
  Table extends Record<string, unknown>,
  Relations extends Record<string, Record<string, unknown>>,
  Select,
  Include
> = (Select extends Record<string, boolean>
  ? { [k in keyof Select]: k extends keyof Table ? Table[k] : never }
  : Table) &
  (Include extends Record<string, Record<string, unknown>>
    ? {
        [k in keyof Include]: {
          [l in keyof Include[k]]: k extends keyof Relations
            ? l extends keyof Relations[k]
              ? Relations[k][l]
              : never
            : never;
        };
      }
    : Include extends Record<string, boolean>
    ? Relations
    : void);

export type CountReturn = {
  count: string;
};
