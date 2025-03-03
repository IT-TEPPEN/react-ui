export type TValueType = "string" | "number" | "date";

export interface ISearchOperator {
  key: string;
  label: string;
  type: TValueType;
}
