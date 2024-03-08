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
      { id: "1", name: "a" },
      { id: "4", name: "c" },
      { id: "3", name: "d" },
      { id: "2", name: "b" },
    ],
    cols: [
      { key: "id", label: "ID" },
      { key: "name", label: "名前" },
    ],
  },
  render: (props) => (
    <div className="w-96">
      <Table {...props} />
    </div>
  ),
};
