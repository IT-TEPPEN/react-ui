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
    <div className="p-8 w-[200vw] h-[200vh]">
      <div className="relative flex w-full h-full border border-red-300 p-8">
        <div className="w-32 shrink-0 h-full"></div>
        <div className="absolute w-full h-[50vh] overflow-auto border border-blue-300 p-8">
          <TableTestComponent />
        </div>
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
