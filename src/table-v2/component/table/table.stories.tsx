import type { Meta, StoryObj } from "@storybook/react";
import { Table } from "./table";

const meta = {
  title: "TableV2/Table",
  component: Table,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} as Meta<
  typeof Table<{
    id: number;
    name: string;
    age: number;
    role: string;
    button: number | string;
  }>
>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    rows: [
      ...Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `name${1000 - i}`,
        age: 20 + (i % 10),
        role: i % 2 === 0 ? "admin" : i % 4 === 1 ? "user" : "",
        button: (i * i) % 7,
      })),
    ],
    cols: [
      {
        key: "id",
        type: "number",
        initialWidth: 12,
      },
      {
        key: "name",
        label: "名前",
        initialWidth: 500,
        minWidth: 100,
        type: "string",
        editable: true,
        constraints: { maxLength: 10, minLength: 1, pattern: "^[a-zA-Z0-9]+$" },
        onCellBlur: (id, value, current, completeEditing) => {
          console.log(id, value, current);
          completeEditing();
        },
      },
      {
        key: "age",
        label: "年齢",
        type: "number",
        editable: true,
        onCellBlur: (id, value, current, completeEditing) => {
          console.log(id, value, current);
          completeEditing();
        },
        constraints: {
          min: 0,
          max: 150,
        },
      },
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
      {
        key: "button",
        label: "ボタン",
        type: "number",
        disableFilter: true,
        render: (value, row) => (
          <button
            className="px-2 py-1 text-white bg-blue-500 rounded-md"
            onClick={(e) => {
              e.preventDefault();
              alert(`Clicked! (id: ${row.id})`);
            }}
          >
            {value % 7}
          </button>
        ),
      },
    ],
    onUpdateRow: (newRow, oldRow) => {
      console.log({ newRow, oldRow });
    },
    initialCondition: {
      sort: {
        key: "age",
        asc: true,
      },
      pagenation: {
        rowCountPerPage: "all",
      },
    },
    conditionalFormattings: [
      {
        condition: (row) => row.age > 24,
        key: "age",
        style: "bg-red-600 text-white",
      },
      {
        condition: (row) => row.role === "admin",
        key: "role",
        style: "bg-blue-600 text-white",
      },
    ],
  },
  render: (props) => (
    <div className="w-screen px-5">
      <Table
        rows={props.rows}
        cols={props.cols}
        onUpdateRow={props.onUpdateRow}
        initialCondition={props.initialCondition}
        conditionalFormattings={props.conditionalFormattings}
      />
    </div>
  ),
};
