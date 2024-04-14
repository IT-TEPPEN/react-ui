export const STRING_FILTER_OPERATOR = [
  { key: "includeText", label: "次の値を含む" },
] as const;

export const NUMBER_FILTER_OPERATOR = [
  { key: "eq", label: "次の値と等しい" },
  { key: "ne", label: "次の値と等しくない" },
  { key: "gt", label: "次の値より大きい" },
  { key: "lt", label: "次の値より小さい" },
  { key: "gte", label: "次の値以上" },
  { key: "lte", label: "次の値以下" },
] as const;

export const SELECT_FILTER_OPERATOR = [
  { key: "selected", label: "次の値と等しい" },
  { key: "notSelected", label: "次の値と等しくない" },
] as const;

export const FILTER_OPERATOR = [
  ...STRING_FILTER_OPERATOR,
  ...NUMBER_FILTER_OPERATOR,
  ...SELECT_FILTER_OPERATOR,
] as const;
