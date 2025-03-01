export type TComponentType = "TargetInput" | "OperatorInput" | "ValueInput";

export type TIdGeneratorContext = {
  generateId: (componentType: TComponentType) => string;
};
