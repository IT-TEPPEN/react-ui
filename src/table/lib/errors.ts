import { ReactUIError } from "../../lib/errors";

export class TableError extends ReactUIError {
  constructor(message: string, code: string, details: string) {
    super(message, code, details);
    this.name = "TableError";
  }
}
