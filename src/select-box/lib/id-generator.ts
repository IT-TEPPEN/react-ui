const ID_PREFIX = "teppen:react-ui:select-box";

export class IdGenerator {
  static generateIdSelectBoxInputArea(id: string): string {
    if (id === "") {
      return `${ID_PREFIX}:input-area`;
    } else {
      return `${ID_PREFIX}:${id}:input-area`;
    }
  }

  static generateIdSelectBoxOptionsArea(id: string): string {
    if (id === "") {
      return `${ID_PREFIX}:options-area`;
    } else {
      return `${ID_PREFIX}:${id}:options-area`;
    }
  }

  static generateIdSelectBoxFrame(id: string): string {
    if (id === "") {
      return `${ID_PREFIX}:frame`;
    } else {
      return `${ID_PREFIX}:${id}:frame`;
    }
  }
}
