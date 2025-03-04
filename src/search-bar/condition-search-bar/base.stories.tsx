import type { Meta, StoryObj } from "@storybook/react";
import { ConditionSearchBar } from "./base";

const meta = {
  title: "SearchBar/ConditionSearchBar",
  component: ConditionSearchBar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} as Meta<typeof ConditionSearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: "search-bar",
    targets: [
      { key: "name", label: "名前", type: "string" },
      { key: "age", label: "年齢", type: "number" },
    ],
    conditions: [
      {
        target: { key: "name", label: "名前", type: "string" },
        operator: {
          key: "string:eq",
          label: "=",
          type: "string",
          inputType: "single string",
        },
        input: {
          type: "single string",
          payload: {
            value: "aaa",
          },
        },
      },
    ],
    onChangeCondition(action) {
      console.log(action);
    },
  },
  render: (props) => (
    <div className="w-[80vw]">
      <ConditionSearchBar {...props} />
    </div>
  ),
};
