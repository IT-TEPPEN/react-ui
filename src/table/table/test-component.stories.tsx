import type { Meta, StoryObj } from "@storybook/react";
import { TableTestComponent } from "./test-component";

const meta = {
  title: "Table/TestComponent",
  component: TableTestComponent,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} as Meta<typeof TableTestComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: () => (
    <div className="p-8">
      <TableTestComponent />
    </div>
  ),
};

export const Multiple: Story = {
  args: {},
  render: () => (
    <div className="bg-slate-700">
      <TableTestComponent id="1" />
      <TableTestComponent id="2" enableDeprecatedCopy />
    </div>
  ),
};
