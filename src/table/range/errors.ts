import { TableError } from "../lib/errors";

export class OutOfRangeError extends TableError {
  constructor(errorNumber: string, message: string, detail: string) {
    super(message, `RUTBL-OR${errorNumber}`, detail);
    this.name = "OutOfRangeError";
  }
}
