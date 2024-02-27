import { render, screen, within } from "@testing-library/react";
import BaseTable from "./base";

describe("SmartRating", () => {
  test("renders the Rating component", () => {
    render(
      <BaseTable
        rows={[
          { id: "1", name: "a" },
          { id: "2", name: "b" },
        ]}
        cols={[{ key: "id" }, { key: "name", label: "名前" }]}
      />
    );

    const item1 = within(screen.getByTestId("1")).getByText("a");
    expect(item1).toBeDefined();
    const item2 = within(screen.getByTestId("2")).getByText("b");
    expect(item2).toBeDefined();
    expect(() => within(screen.getByTestId("1")).getByText("b")).toThrow();

    const header = screen.getByTestId("table-header");
    expect(within(header).getByText("名前")).toBeDefined();
  });
});
