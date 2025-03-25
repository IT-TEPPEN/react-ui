export const NONE = "none";
export const SINGLE_STRING = "single string";
export const SINGLE_NUMBER = "single number";
export const SINGLE_DATE = "single date";
export const SINGLE_DATETIME = "single datetime";
export const RANGE_STRING = "range string";
export const RANGE_NUMBER = "range number";
export const RANGE_DATE = "range date";
export const SELECT = "select";
export const MULTI_SELECT = "multi select";

export const DEFAULT_SEARCH_OPERATOR = [
  {
    key: "string:eq",
    label: "=",
    type: "string",
    inputType: SINGLE_STRING,
  },
  {
    key: "string:neq",
    label: "≠",
    type: "string",
    inputType: SINGLE_STRING,
  },
  {
    key: "string:like",
    label: "like",
    type: "string",
    inputType: SINGLE_STRING,
  },
  {
    key: "string:not_like",
    label: "not like",
    type: "string",
    inputType: SINGLE_STRING,
  },
  // { key: "string:in", label: "in", type: "string" },
  // { key: "string:not_in", label: "not in", type: "string" },
  {
    key: "string:is_null",
    label: "is empty",
    type: "string",
    inputType: NONE,
  },
  {
    key: "string:is_not_null",
    label: "is not empty",
    type: "string",
    inputType: NONE,
  },
  {
    key: "number:eq",
    label: "=",
    type: "number",
    inputType: SINGLE_NUMBER,
  },
  {
    key: "number:neq",
    label: "≠",
    type: "number",
    inputType: SINGLE_NUMBER,
  },
  {
    key: "number:gt",
    label: ">",
    type: "number",
    inputType: SINGLE_NUMBER,
  },
  {
    key: "number:lt",
    label: "<",
    type: "number",
    inputType: SINGLE_NUMBER,
  },
  {
    key: "number:gte",
    label: "≧",
    type: "number",
    inputType: SINGLE_NUMBER,
  },
  {
    key: "number:lte",
    label: "≦",
    type: "number",
    inputType: SINGLE_NUMBER,
  },
  {
    key: "select:eq",
    label: "=",
    type: "select",
    inputType: SELECT,
  },
  {
    key: "select:neq",
    label: "≠",
    type: "select",
    inputType: SELECT,
  },
  {
    key: "select:is_null",
    label: "is empty",
    type: "select",
    inputType: NONE,
  },
  {
    key: "select:is_not_null",
    label: "is not empty",
    type: "select",
    inputType: NONE,
  },
  // { key: "date:eq", label: "=", type: "date" },
  // { key: "date:neq", label: "≠", type: "date" },
  // { key: "date:gt", label: ">", type: "date" },
  // { key: "date:lt", label: "<", type: "date" },
  // { key: "date:gte", label: ">=", type: "date" },
  // { key: "date:lte", label: "<=", type: "date" },
  // { key: "date:is_null", label: "is null", type: "date" },
  // { key: "date:is_not_null", label: "is not null", type: "date" },
  {
    key: "datetime:gt",
    label: ">",
    type: "datetime",
    inputType: SINGLE_DATETIME,
  },
  {
    key: "datetime:lt",
    label: "<",
    type: "datetime",
    inputType: SINGLE_DATETIME,
  },
  {
    key: "datetime:gte",
    label: "≧",
    type: "datetime",
    inputType: SINGLE_DATETIME,
  },
  {
    key: "datetime:lte",
    label: "≦",
    type: "datetime",
    inputType: SINGLE_DATETIME,
  },
  {
    key: "datetime:is_null",
    label: "is empty",
    type: "datetime",
    inputType: NONE,
  },
  {
    key: "datetime:is_not_null",
    label: "is not empty",
    type: "datetime",
    inputType: NONE,
  },
] as const;

export type T_DEFAULT_SEARCH_OPERATOR =
  (typeof DEFAULT_SEARCH_OPERATOR)[number];

export type T_SEARCH_INPUT_TYPE = T_DEFAULT_SEARCH_OPERATOR["inputType"];
