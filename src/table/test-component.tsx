"use client";

import { useReducer } from "react";
import Table from "./base";

type TState = {
  id: number;
  name: string;
  age: number;
  role: string;
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

export function TableTestComponent() {
  const [state, dispatch] = useReducer(reducer, [
    ...Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      name: `name${1000 - i}`,
      age: 20 + (i % 10),
      role: i % 2 === 0 ? "admin" : i % 4 === 1 ? "user" : "",
      button: (i * i) % 7,
    })),
  ]);

  return (
    <Table
      rows={state}
      cols={[
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
          initialWidth: 50,
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
          initialWidth: 100,
          type: "select",
          editable: true,
          options: [
            { value: "admin", label: "管理者" },
            { value: "user", label: "ユーザー" },
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
      }}
      initialCondition={{
        sort: {
          key: "age",
        },
        pagenation: { rowCountPerPage: "all" },
      }}
    />
  );
}
