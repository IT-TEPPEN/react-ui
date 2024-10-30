export class ReactUIError extends Error {
  code: string;
  details: string;
  timestamp: Date;

  constructor(message: string, code: string, details: string) {
    super(message);
    this.name = "ReactUIError";
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}
