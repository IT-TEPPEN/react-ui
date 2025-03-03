export const DEFAULT_SEARCH_OPERATOR = [
  { key: "string:eq", label: "=", type: "string" },
  { key: "string:neq", label: "≠", type: "string" },
  { key: "string:like", label: "like", type: "string" },
  { key: "string:not_like", label: "not like", type: "string" },
  { key: "string:in", label: "in", type: "string" },
  { key: "string:not_in", label: "not in", type: "string" },
  { key: "string:is_null", label: "is null", type: "string" },
  { key: "string:is_not_null", label: "is not null", type: "string" },
  { key: "number:eq", label: "=", type: "number" },
  { key: "number:neq", label: "≠", type: "number" },
  { key: "number:gt", label: ">", type: "number" },
  { key: "number:lt", label: "<", type: "number" },
  { key: "number:gte", label: ">=", type: "number" },
  { key: "number:lte", label: "<=", type: "number" },
  // { key: "date:eq", label: "=", type: "date" },
  // { key: "date:neq", label: "≠", type: "date" },
  // { key: "date:gt", label: ">", type: "date" },
  // { key: "date:lt", label: "<", type: "date" },
  // { key: "date:gte", label: ">=", type: "date" },
  // { key: "date:lte", label: "<=", type: "date" },
  // { key: "date:is_null", label: "is null", type: "date" },
  // { key: "date:is_not_null", label: "is not null", type: "date" },
] as const;

export type T_DEFAULT_SEARCH_OPERATOR =
  (typeof DEFAULT_SEARCH_OPERATOR)[number];
