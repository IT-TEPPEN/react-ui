import { MESSAGES } from "../locale/messages";

export type TStringValidateOption = {
  maxLength?: number;
  minLength?: number;
  pattern?: string;
};

export type TNumberValidateOption = {
  max?: number;
  min?: number;
};

type TPropsGenerateValidateFunction = {
  key: string;
  label: string;
} & (
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
    }
  | {
      type: "date";
    }
  | {
      type: "datetime";
    }
);

type TStringValidateFunction = (value: string) => boolean;

export type TErrorValidation = {
  label: string;
  value: string | number;
} & (
  | {
      type: "STRING_IS_TOO_LONG";
      maxLength: number;
      currentLength: number;
    }
  | {
      type: "STRING_IS_TOO_SHORT";
      minLength: number;
      currentLength: number;
    }
  | {
      type: "STRING_PATTERN_NOT_MATCH";
      pattern: string;
    }
  | {
      type: "NUMBER_IS_TOO_LARGE";
      max: number;
    }
  | {
      type: "NUMBER_IS_TOO_SMALL";
      min: number;
    }
  | {
      type: "NOT_NUMBER";
    }
  | {
      type: "NOT_IN_OPTIONS";
      options: string[];
    }
  | {
      type: "NOT_DATE";
    }
  | {
      type: "NOT_DATETIME";
    }
);

// Used when no errorHandler is given. The table passes its own handler with
// the messages of its locale, so this is only a fallback.
function defaultErrorHandler(errors: TErrorValidation[]) {
  alert(MESSAGES.ja.validation(errors));
}

function generateStringValidateFunction(
  key: string,
  label: string,
  constraints?: TStringValidateOption,
  errorHandler?: (errors: TErrorValidation[]) => void
): TStringValidateFunction {
  return (value: string) => {
    const errors: TErrorValidation[] = [];

    if (constraints?.maxLength) {
      if (value.length > constraints.maxLength) {
        errors.push({
          type: "STRING_IS_TOO_LONG",
          label,
          maxLength: constraints.maxLength,
          currentLength: value.length,
          value,
        });
      }
    }

    if (constraints?.minLength) {
      if (value.length < constraints.minLength) {
        errors.push({
          type: "STRING_IS_TOO_SHORT",
          label,
          minLength: constraints.minLength,
          currentLength: value.length,
          value,
        });
      }
    }

    if (constraints?.pattern) {
      if (!new RegExp(constraints.pattern).test(value)) {
        errors.push({
          type: "STRING_PATTERN_NOT_MATCH",
          label,
          pattern: constraints.pattern,
          value,
        });
      }
    }

    if (errors.length > 0) {
      if (errorHandler) {
        errorHandler(errors);
      } else {
        defaultErrorHandler(errors);
      }
      return false;
    }

    return true;
  };
}

type TNumberValidateFunction = (value: number) => boolean;

function generateNumberValidateFunction(
  key: string,
  label: string,
  constraints?: TNumberValidateOption,
  errorHandler?: (errors: TErrorValidation[]) => void
): TNumberValidateFunction {
  return (value: number | string) => {
    const errors: TErrorValidation[] = [];

    if (typeof value === "string") {
      // 小数も含めて数値に変換可能な値かを検査
      if (!/^-?[0-9]+(\.[0-9]+)?$/.test(value)) {
        errors.push({
          type: "NOT_NUMBER",
          label,
          value,
        });

        if (errorHandler) {
          errorHandler(errors);
        } else {
          defaultErrorHandler(errors);
        }
        return false;
      }
    }

    value = Number(value);

    if (typeof constraints?.max === "number") {
      if (value > constraints.max) {
        errors.push({
          type: "NUMBER_IS_TOO_LARGE",
          label,
          max: constraints.max,
          value,
        });
      }
    }

    if (typeof constraints?.min === "number") {
      if (value < constraints.min) {
        errors.push({
          type: "NUMBER_IS_TOO_SMALL",
          label,
          min: constraints.min,
          value,
        });
      }
    }

    if (errors.length > 0) {
      if (errorHandler) {
        errorHandler(errors);
      } else {
        defaultErrorHandler(errors);
      }
      return false;
    }

    return true;
  };
}

type TSelectValidateFunction = (label: string) => boolean;

function generatSelectValidateFunction(
  key: string,
  columnLabel: string,
  options: { value: string; label: string }[],
  allowEmpty?: boolean,
  errorHandler?: (errors: TErrorValidation[]) => void
): TSelectValidateFunction {
  const labelSets = new Set(options.map((option) => option.label));
  return (label: string) => {
    if (allowEmpty && label === "") {
      return true;
    }

    const errors: TErrorValidation[] = [];

    if (!labelSets.has(label)) {
      errors.push({
        type: "NOT_IN_OPTIONS",
        label: columnLabel,
        value: label,
        options: Array.from(labelSets),
      });
    }

    if (errors.length > 0) {
      if (errorHandler) {
        errorHandler(errors);
      } else {
        defaultErrorHandler(errors);
      }
      return false;
    }

    return true;
  };
}

type TDateValidateFunction = (label: string) => boolean;

function generatDateValidateFunction(
  key: string,
  columnLabel: string,
  errorHandler?: (errors: TErrorValidation[]) => void
): TDateValidateFunction {
  return (value: string) => {
    const errors: TErrorValidation[] = [];

    if (isNaN(new Date(value).getTime())) {
      errors.push({
        type: "NOT_DATE",
        label: columnLabel,
        value,
      });
    }

    if (errors.length > 0) {
      if (errorHandler) {
        errorHandler(errors);
      } else {
        defaultErrorHandler(errors);
      }
      return false;
    }

    return true;
  };
}

type TDatetimeValidateFunction = (label: string) => boolean;

function generatDatetimeValidateFunction(
  key: string,
  columnLabel: string,
  errorHandler?: (errors: TErrorValidation[]) => void
): TDatetimeValidateFunction {
  return (value: string) => {
    const errors: TErrorValidation[] = [];

    if (isNaN(new Date(value).getTime())) {
      errors.push({
        type: "NOT_DATETIME",
        label: columnLabel,
        value,
      });
    }

    if (errors.length > 0) {
      if (errorHandler) {
        errorHandler(errors);
      } else {
        defaultErrorHandler(errors);
      }
      return false;
    }

    return true;
  };
}

export function generateValidateFunction(
  props: TPropsGenerateValidateFunction,
  errorHandler?: (errors: TErrorValidation[]) => void
) {
  if (props.type === "string") {
    return generateStringValidateFunction(
      props.key,
      props.label,
      props.constraints,
      errorHandler
    );
  } else if (props.type === "number") {
    return generateNumberValidateFunction(
      props.key,
      props.label,
      props.constraints,
      errorHandler
    );
  } else if (props.type === "select") {
    return generatSelectValidateFunction(
      props.key,
      props.label,
      props.options,
      props.allowEmpty,
      errorHandler
    );
  } else if (props.type === "date") {
    return generatDateValidateFunction(props.key, props.label, errorHandler);
  } else if (props.type === "datetime") {
    return generatDatetimeValidateFunction(
      props.key,
      props.label,
      errorHandler
    );
  } else {
    throw new Error("Invalid type");
  }
}
