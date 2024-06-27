import { DataObject, DataRecord } from "../type";

export type CheckboxStatusState<T extends DataRecord> = {
  checkedRecords: DataObject<T>[];
};

export type CheckboxStatusAction<T extends DataRecord> = {
  type: "SET";
  payload: { checkedRecords: DataObject<T>[] };
};

export type CheckboxStatusReducer<T extends DataRecord> = (
  state: CheckboxStatusState<T>,
  action: CheckboxStatusAction<T>
) => CheckboxStatusState<T>;
