import type { Meta, StoryObj } from "@storybook/react";
import { SortIcon } from "./sort-icon";

const meta = {
  title: "Table/SortIcon",
  component: SortIcon,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} as Meta<typeof SortIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    sortOrder: "ASC",
    isSortActive: true,
    size: 10,
  },
  render: (props) => <SortIcon {...props} />,
};
