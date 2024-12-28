import { Meta, StoryObj } from "@storybook/react";
import { TestComponent } from "./test-component";

const meta = {
  title: "FileUploader/TestComponent",
  component: TestComponent,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} as Meta<typeof TestComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
