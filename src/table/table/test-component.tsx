"use client";

import { useEffect, useReducer, useState } from "react";
import Table from "./base";

interface IOption {
  value: string;
  label: string;
}

const OPTIONS: IOption[] = [
  {
    value: "january",
    label: "1月",
  },
  {
    value: "february",
    label: "2月",
  },
  {
    value: "march",
    label: "3月",
  },
  {
    value: "april",
    label: "4月",
  },
  {
    value: "may",
    label: "5月",
  },
  {
    value: "june",
    label: "6月",
  },
  {
    value: "july",
    label: "7月",
  },
  {
    value: "august",
    label: "8月",
  },
  {
    value: "september",
    label: "9月",
  },
  {
    value: "october",
    label: "10月",
  },
  {
    value: "november",
    label: "11月",
  },
  {
    value: "december",
    label: "12月",
  },
];

type TState = {
  id: number;
  name: string;
  age: number;
  role: string;
  birthdayMonth: string;
  birthday: Date;
  button: number;
}[];

type TAction = {
  type: "update";
  payload: {
    id: number;
    key: string;
    value: string | number;
  };
};

function reducer(state: TState, action: TAction) {
  switch (action.type) {
    case "update":
      return state.map((row) => {
        if (row.id === action.payload.id) {
          return {
            ...row,
            [action.payload.key]: action.payload.value,
          };
        }
        return row;
      });
    default:
      return state;
  }
}

export function TableTestComponent(props: {
  id?: string;
  enableDeprecatedCopy?: boolean;
}) {
  const [state, dispatch] = useReducer(reducer, [
    ...Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      name: `name${1000 - i}`,
      age: 20 + (i % 10),
      role: i % 2 === 0 ? "admin" : i % 4 === 1 ? "user" : "",
      birthdayMonth: "",
      birthday: new Date(2000 + (i % 10), i % 12, (i % 28) + 1),
      button: (i * i) % 7,
    })),
  ]);
  const [options, setOptions] = useState<IOption[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOptions(OPTIONS);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Table
      maxHeight="50vh"
      id={props.id}
      rows={state}
      cols={[
        {
          key: "id",
          type: "number",
        },
        {
          key: "name",
          label: "名前(カタカナでもひらがなでも)",
          initialWidth: 500,
          minWidth: 100,
          type: "string",
          editable: true,
          constraints: {
            maxLength: 10,
            minLength: 1,
            pattern: "^[a-zA-Z0-9]+$",
          },
          onCellBlur: (id, value, current, completeEditing) => {
            dispatch({
              type: "update",
              payload: { id: current.id, key: id, value },
            });
            completeEditing();
          },
        },
        {
          key: "age",
          label: "年齢",
          type: "number",
          editable: true,
          onCellBlur: (id, value, current, completeEditing) => {
            dispatch({
              type: "update",
              payload: { id: current.id, key: id, value },
            });
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
            {
              value: "admin",
              label: "管理者",
              searchText: "管理者administratorかんりしゃカンリシャ",
            },
            {
              value: "user",
              label: "ユーザー",
              searchText: "ユーザーuserゆーざー",
            },
          ],
          allowEmpty: true,
          onCellBlur: (id, value, current, completeEditing) => {
            dispatch({
              type: "update",
              payload: { id: current.id, key: id, value },
            });
            completeEditing();
          },
        },
        {
          key: "birthdayMonth",
          label: "誕生月",
          type: "select",
          options,
          allowEmpty: true,
          editable: true,
          onCellBlur: (id, value, current, completeEditing) => {
            dispatch({
              type: "update",
              payload: { id: current.id, key: id, value },
            });
            completeEditing();
          },
        },
        {
          key: "birthday",
          label: "誕生日",
          type: "date",
          render: (value) => value.toLocaleDateString(),
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
      ]}
      onUpdateRow={(newRow, oldRow) => {
        console.log({ newRow, oldRow });
        if (newRow.name !== oldRow.name) {
          dispatch({
            type: "update",
            payload: { id: newRow.id, key: "name", value: newRow.name },
          });
        }

        if (newRow.age !== oldRow.age) {
          dispatch({
            type: "update",
            payload: { id: newRow.id, key: "age", value: newRow.age },
          });
        }

        if (newRow.role !== oldRow.role) {
          dispatch({
            type: "update",
            payload: { id: newRow.id, key: "role", value: newRow.role },
          });
        }

        if (newRow.birthdayMonth !== oldRow.birthdayMonth) {
          dispatch({
            type: "update",
            payload: {
              id: newRow.id,
              key: "birthdayMonth",
              value: newRow.birthdayMonth,
            },
          });
        }
      }}
      initialCondition={{
        sort: {
          key: "age",
        },
        pagenation: { rowCountPerPage: "all" },
      }}
      conditionalFormattings={[
        {
          condition: (row) => row.role === "",
          key: "id",
          style: "bg-gray-200",
        },
        {
          condition: (row) => row.role === "",
          key: "name",
          style: "bg-gray-200",
        },
        {
          condition: (row) => row.role === "",
          key: "role",
          style: "bg-gray-200",
        },
        {
          condition: (row) => row.role === "",
          key: "button",
          style: "bg-gray-200",
        },
        {
          condition: (row) => row.role === "",
          key: "age",
          style: "bg-gray-200 text-gray-500",
        },
        {
          condition: (row) => row.age > 21,
          key: "age",
          style: "text-red-500",
        },
        {
          condition: (row) => row.role === "admin",
          key: "role",
          style: "text-blue-500",
        },
      ]}
      deprecatedOptions={{
        enableDeprecatedCopy: props.enableDeprecatedCopy,
      }}
    />
  );
}
