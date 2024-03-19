import type { Meta, StoryObj } from "@storybook/react";
import Table from "./base";

const meta = {
  title: "Table/BaseTable",
  component: Table,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} as Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    rows: [
      ...Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `name${1000 - i}`,
        age: 20 + (i % 10),
      })),
    ],
    cols: [
      { key: "id", label: "ID", type: "number" },
      { key: "name", label: "名前", type: "string" },
      { key: "age", label: "年齢", type: "number" },
    ],
  },
  render: (props) => (
    <div className="w-96">
      <Table {...props} />
    </div>
  ),
};
