/** Parts of the search bar with ids: the input, the value in the panel, a condition. */
export type TComponentType =
  | "TargetInput"
  | "ValueInput"
  | `Condition-${number}`;

export type TIdGeneratorContext = {
  generateId: (componentType: TComponentType) => string;
};
