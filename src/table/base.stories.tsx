import type { Meta, StoryObj } from "@storybook/react";
import BaseTable from "./base";

const meta = {
  title: "Table/BaseTable",
  component: BaseTable,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} as Meta<typeof BaseTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    rows: [
      { id: "1", name: "a" },
      { id: "2", name: "b" },
    ],
    cols: [
      { key: "id", label: "ID" },
      { key: "name", label: "名前" },
    ],
  },
  render: (props) => (
    <div className="w-96">
      <BaseTable {...props} />
    </div>
  ),
};
