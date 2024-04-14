import type { Meta, StoryObj } from "@storybook/react";
import { FIlterIcon } from "./filter-icon";

const meta = {
  title: "Table/Icon/Filter",
  component: FIlterIcon,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} as Meta<typeof FIlterIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 10,
    isFilterActive: true,
  },
  render: (props) => <FIlterIcon {...props} />,
};
