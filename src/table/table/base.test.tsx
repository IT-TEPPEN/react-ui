import { cleanup, render, within } from "@testing-library/react";
import Table from "./base";

afterEach(cleanup);

describe("SmartRating", () => {
  test("renders the Rating component", () => {
    const { getByTestId, getByRole } = render(
      <Table
        rows={[
          { id: "1", name: "a" },
          { id: "2", name: "b" },
        ]}
        cols={[
          { key: "id", type: "string" },
          { key: "name", type: "string", label: "名前" },
        ]}
      />
    );

    const item1 = within(getByTestId("1")).getByText("a");
    expect(item1).toBeDefined();
    const item2 = within(getByTestId("2")).getByText("b");
    expect(item2).toBeDefined();
    expect(() => within(getByTestId("1")).getByText("b")).toThrow();

    const header2 = getByRole("columnheader", { name: /名前/ });
    expect(header2).toBeDefined();
  });
});
