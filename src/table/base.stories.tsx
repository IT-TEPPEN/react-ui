import type { Meta, StoryObj } from "@storybook/react";
import Table from "./base";

const meta = {
  title: "Table/BaseTable",
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
        initialWidth: 50,
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
        initialWidth: 100,
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
        initialWidth: 50,
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
    // onClickRow: (row) => {
    //   alert(row.id);
    // },
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
      pagenation: {
        rowCountPerPage: 50,
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
    checkbox: {
      checked: (row) => row.id % 2 == 1,
      onChecked: (row) => console.log("checked", row.id),
      onUnchecked: (row) => console.log("unchecked", row.id),
    },
    conditionalFormattings: [
      {
        condition: (row) => row.age < 31,
        key: "age",
        style: "text-red-500 font-bold text-lg bg-red-100",
      },
      {
        condition: (row) => row.role === "2",
        key: "role",
        style: "text-blue-500 font-bold text-lg shadow-inner shadow-blue-500",
      },
      {
        condition: (row) => row.age < 35,
        key: "age",
        style: "text-green-500 font-bold text-lg bg-green-100",
      },
    ],
  },
  render: (props) => (
    <div className=" w-screen px-5">
      <Table {...props} />
    </div>
  ),
};
