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
      ...Array.from({ length: 10000 }, (_, i) => ({
        id: i + 1,
        name: `name${1000 - i}`,
      })),
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
