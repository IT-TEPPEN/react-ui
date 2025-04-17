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
    <div className="flex">
      <div className="p-4 w-[24rem] shrink-0">
        <ul className="flex flex-col gap-2">
          <li>Click the cell to edit</li>
          <li>Click the button to edit</li>
          <li>Click the select to edit</li>
          <li>Click the date to edit</li>
          <li>Click the checkbox to edit</li>
        </ul>
      </div>
      <div className="p-8 w-[calc(100%-24rem)] h-[80vh]">
        <TableTestComponent />
      </div>
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
