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
        role: i % 2 === 0 ? "admin" : i % 4 === 1 ? "user" : "",
        button: (i * i) % 7,
      })),
    ],
    cols: [
      {
        key: "id",
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
      {
        key: "button",
        label: "ボタン",
        type: "number",
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
    onClickRow: (row) => {
      alert(row.id);
    },
  },
  render: (props) => (
    <div className=" w-screen px-5">
      <Table {...props} />
    </div>
  ),
};

export const Readme: Story = {
  args: {
    rows: [
      {
        id: 1,
        name: "Taro",
        age: 30,
        role: "",
        button: "Click",
      },
      {
        id: 2,
        name: "Yoshiko",
        age: 60,
        role: "1",
        button: "Click",
      },
      {
        id: 3,
        name: "Koki",
        age: 13,
        role: "2",
        button: "Click",
      },
      {
        id: 4,
        name: "Chisato",
        age: 34,
        role: "2",
        button: "Click",
      },
    ],
    cols: [
      { key: "id", label: "ID", type: "number" },
      {
        key: "name",
        label: "名前",
        type: "string",
        editable: true,
        constraints: {
          maxLength: 10,
          minLength: 1,
          pattern: "^[a-zA-Z0-9]+$",
        },
        onCellBlur: (key, value, current, completeEditing) => {
          console.log(key, value, current);
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
          { value: "1", label: "管理者" },
          { value: "2", label: "オペレーター" },
        ],
        allowEmpty: true,
        onCellBlur: (key, value, current, completeEditing) => {
          console.log(key, value, current);
          completeEditing();
        },
      },
      {
        key: "button",
        label: "ボタン",
        type: "string",
        render: (value, row) => (
          <button
            className="px-2 py-1 text-white bg-blue-500 rounded-md"
            onClick={(e) => {
              e.preventDefault();
              alert(`Clicked button: (id: ${row.id})`);
            }}
          >
            {value}
          </button>
        ),
      },
    ],
    initialCondition: {
      sort: {
        key: "id",
        asc: true,
      },
    },
    onClickRow: (row) => {
      alert(`Clicked row: (id: ${row.id})`);
    },
    applyRowFormatting: (row) => {
      if (row.role === "1") {
        return "bg-red-600 text-white";
      } else {
        return "";
      }
    },
  },
  render: (props) => (
    <div className=" w-screen px-5">
      <Table {...props} />
    </div>
  ),
};
