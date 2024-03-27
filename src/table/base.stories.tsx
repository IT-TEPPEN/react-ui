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
      ...Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `name${1000 - i}`,
        age: 20 + (i % 10),
        onClick: () => {
          alert(i + 1);
        },
        role: i % 2 === 0 ? "admin" : i % 4 === 1 ? "user" : "",
        button: (
          <button
            className="px-2 py-1 text-white bg-blue-500 rounded-md"
            onClick={(e) => {
              e.preventDefault();
              alert(`Clicked! (id: ${i + 1})`);
            }}
          >
            click
          </button>
        ),
      })),
    ],
    cols: [
      {
        key: "id",
        label: "ID",
        type: "number",
        editable: true,
        constraints: { min: 1, max: 1000 },
        onCellBlur: (id, value, current, completeEditing) => {
          console.log(id, value, current);
          completeEditing();
        },
      },
      {
        key: "name",
        label: "名前",
        type: "string",
        editable: true,
        constraints: { maxLength: 10, minLength: 1, pattern: "^[a-zA-Z0-9]+$" },
        onCellBlur: (id, value, current, completeEditing) => {
          console.log(id, value, current);
          completeEditing();
        },
      },
      { key: "age", label: "年齢", type: "number" },
      {
        key: "role",
        label: "役割",
        type: "select",
        editable: true,
        options: [
          { value: "admin", label: "管理者" },
          { value: "user", label: "ユーザー" },
        ],
        allowEmpty: true,
        onCellBlur: (id, value, current, completeEditing) => {
          console.log(id, value, current);
          completeEditing();
        },
      },
      { key: "button", type: "component" },
    ],
  },
  render: (props) => (
    <div className=" w-screen px-5">
      <Table {...props} />
    </div>
  ),
};
