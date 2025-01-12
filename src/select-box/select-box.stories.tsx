import type { Meta, StoryObj } from "@storybook/react";
import { SelectBox } from ".";

const meta = {
  title: "SelectBox/Base",
  component: SelectBox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} as Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    options: [
      { value: "apple", label: "りんご" },
      { value: "orange", label: "みかん" },
      { value: "grape", label: "ぶどう" },
    ],
    onSelect: (value: string) => {
      console.log(value);
    },
  },
};
