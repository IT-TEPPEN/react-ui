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
    }
  | {
      type: "select";
      options: { value: string; label: string }[];
      allowEmpty?: boolean;
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
  return (value: number | string) => {
    if (typeof value === "string") {
      // 小数も含めて数値に変換可能な値かを検査
      if (!/^-?[0-9]+(\.[0-9]+)?$/.test(value)) {
        alert("数値ではない値が入力されています。");
        return false;
      }
      value = Number(value);
    }

    if (typeof constraints?.max === "number") {
      if (value > constraints.max) {
        alert(`最大値(${constraints.max})を超過しています。(入力値:${value})`);
        return false;
      }
    }

    if (typeof constraints?.min === "number") {
      if (value < constraints.min) {
        alert(`最小値(${constraints.min})を下回っています。(入力値:${value})`);
        return false;
      }
    }

    return true;
  };
}

type TSelectValidateFunction = (label: string) => boolean;

function generatSelectValidateFunction(
  options: { value: string; label: string }[],
  allowEmpty?: boolean
): TSelectValidateFunction {
  const labelSets = new Set(options.map((option) => option.label));
  return (label: string) => {
    if (allowEmpty && label === "") {
      return true;
    }

    if (!labelSets.has(label)) {
      alert(`選択肢に含まれていない値です。(選択肢:${label})`);
      return false;
    }

    return true;
  };
}

export function generateValidateFunction(
  props: TPropsGenerateValidateFunction
) {
  if (props.type === "string") {
    return generateStringValidateFunction(props.constraints);
  } else if (props.type === "number") {
    return generateNumberValidateFunction(props.constraints);
  } else if (props.type === "select") {
    return generatSelectValidateFunction(props.options, props.allowEmpty);
  } else {
    throw new Error("Invalid type");
  }
}
