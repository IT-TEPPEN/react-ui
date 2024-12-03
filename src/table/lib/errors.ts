import { ReactUIError } from "../../lib/errors";

export class TableError extends ReactUIError {
  constructor(message: string, code: string, details: string) {
    super(message, code, details);
    this.name = "TableError";
  }
}

export class NoImplementeFunctionError extends ReactUIError {
  constructor() {
    super(
      "Function not implemented.",
      "RUTBL-NIF001",
      "This function is not implemented."
    );
    this.name = "NoImplementeFunctionError";
  }
}

export function NoImplementeFunction() {
  throw new NoImplementeFunctionError();
}
