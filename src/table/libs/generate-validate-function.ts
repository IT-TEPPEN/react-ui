export type TStringValidateOption = {
  maxLength?: number;
  minLength?: number;
  pattern?: string;
};

export type TNumberValidateOption = {
  max?: number;
  min?: number;
};

type TPropsGenerateValidateFunction =
  | {
      type: "string";
      constraints?: TStringValidateOption;
    }
  | {
      type: "number";
      constraints?: TNumberValidateOption;
    };

type TStringValidateFunction = (value: string) => boolean;

function generateStringValidateFunction(
  constraints?: TStringValidateOption
): TStringValidateFunction {
  return (value: string) => {
    if (constraints?.maxLength) {
      if (value.length > constraints.maxLength) {
        alert(
          `最大文字数(${constraints.maxLength})を超過しています。(現在${value.length}文字)`
        );
        return false;
      }
    }
    if (constraints?.minLength) {
      if (value.length < constraints.minLength) {
        alert(
          `最小文字数(${constraints.minLength})を下回っています。(現在${value.length}文字)`
        );
        return false;
      }
    }
    if (constraints?.pattern) {
      if (!new RegExp(constraints.pattern).test(value)) {
        alert(`パターンに一致しません。(パターン${constraints.pattern})`);
        return false;
      }
    }
    return true;
  };
}

type TNumberValidateFunction = (value: number) => boolean;

function generateNumberValidateFunction(
  constraints?: TNumberValidateOption
): TNumberValidateFunction {
  return (value: number) => {
    if (constraints?.max) {
      if (value > constraints.max) {
        alert(`最大値(${constraints.max})を超過しています。(入力値:${value})`);
        return false;
      }
    }

    if (constraints?.min) {
      if (value < constraints.min) {
        alert(`最小値(${constraints.min})を下回っています。(入力値:${value})`);
        return false;
      }
    }

    return true;
  };
}

export function generateValidateFunction({
  type,
  constraints,
}: TPropsGenerateValidateFunction) {
  if (type === "string") {
    return generateStringValidateFunction(constraints);
  } else if (type === "number") {
    return generateNumberValidateFunction(constraints);
  } else {
    throw new Error("Invalid type");
  }
}
