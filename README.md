# React-UI

This is a React component library that provides some useful UI elements for your web applications.

## Components

This library includes the following components:

- Table: A simple Table. (1.0.0 ～) (※ Not compatible with 0.\*.\*)

## Installation

You can install this library using npm or yarn.

```bash
npm i @teppen/react-ui
```

This library has the following peer dependencies:

- react
- react-dom

### Tailwind CSS Installation and Setup

Please follow the installation procedure described in the following tailwindcss website.

- URL: https://tailwindcss.com/docs/installation/framework-guides

To use the React-UI library, add a `content` in `tailwind.config.js` to `"./node_modules/@teppen/react-ui/dist/**/*.js"`.

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "<The path where you are placing the component files>",
    "./node_modules/@teppen/react-ui/dist/**/*.js",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

## Usage

To use this library, you need to import the components you want to use and render them in your React application.

For example, to use the Table component, you can do something like this:

```tsx
import React from "react";
import { Table } from "@teppen/react-ui";

const App = () => {
  return (
    <div>
      <Table
        rows={[
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
        ]}
        cols={[
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
            disableSort: true,
            disableFilter: true,
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
        ]}
        initialCondition={{
          sort: {
            key: "id",
            asc: true,
          },
          pagenation: {
            rowCountPerPage: 50,
          },
        }}
        onClickRow={(row) => {
          alert(`Clicked row: (id: ${row.id})`);
        }}
        onUpdateRow={(newRow, oldRow) => {
          alert({ newRow, oldRow });
        }}
        applyRowFormatting={(row) => {
          if (row.role === "1") {
            return "bg-red-600 text-white";
          } else {
            return "";
          }
        }}
        checkbox={{
          checked: (row) => row.id % 2 == 1,
          onChecked: (row) => console.log("checked", row.id),
          onUnchecked: (row) => console.log("unchecked", row.id),
        }}
        conditionalFormattings={[
          {
            condition: (row) => row.age < 31,
            key: "age",
            style: "text-red-500 font-bold text-lg bg-red-100",
          },
          {
            condition: (row) => row.role === "2",
            key: "role",
            style:
              "text-blue-500 font-bold text-lg shadow-inner shadow-blue-500",
          },
          {
            condition: (row) => row.age < 35,
            key: "age",
            style: "text-green-500 font-bold text-lg bg-green-100",
          },
        ]}
      />
    </div>
  );
};

export default App;
```

### Table Component

A component that displays a table based on the row and column information passed as arguments. The table component has the following features:

- Pagination function
- Sorting function
- Filtering function (only when `label` is set in the column information)
- Editing function (only when `editable` is true and `onCellBlur` is set in the column information)
- Checkbox function
- Paste function
- Conditional formatting function

#### Arguments

The table component only accepts the arguments `rows`, `cols`, `initialCondition`, `onClickRow`, `onUpdateRow`, `applyRowFormatting`, `conditionalFormattings`. Details for each argument are described below.

##### rows

`rows` is an array of the following associative array (`DataObject`). Only id is required and it must be unique within the array.

```ts
export type DataObject = {
  [key: string]: number | string;
  id: number | string;
};
```

※ `onClick` property has been deprecated since version 1.0.0 in favor of the new Table argument `onClickRow`

##### cols

In `cols`, you specify the data to be displayed in the table from left to right. The `key` here needs to match the key name in each element of rows.

it is not necessary to always include the key `label`, but it is required for some functions, so it is recommended to set it.

```ts
export type TColumnType = "string" | "number" | "select";

export type TTableColumn = {
  key: string;
  label?: string;
  type: TColumnType;
  disableSort?: boolean;
  disableFilter?: boolean;
  options: { value: string; label: string }[]; // Only When "type" is "select"
  editable?: boolean;
  render?: (value: string | number, row: DataObject) => React.ReactNode; // Only When "editable" is false
  allowEmpty?: boolean; // Only When "type" is "select"
  constraints?: {
    maxLength?: number; // Only when "type" is "string"
    minLength?: number; // Only when "type" is "string"
    pattern?: string; // Only when "type" is "string"
    max?: number; // Only when "type" is "number"
    min?: number; // Only when "type" is "number"
  };
  onCellBlur?: (
    key: string,
    value: number | string, // Value in cell after change
    current: DataObject, // Row data before change
    completeEditing: () => void // Function to exit cell edit mode
  ) => void;
};
```

※ TColumnType no longer supports `component` since version 1.0.0. Instead, `render`
is now supported, allowing for sorting and filtering functions that were not previously supported by `component`.

##### initialCondition

In `initialCondition`, you can set initial values for each function. This is optional.

```ts
type TInitialCondition = {
  sort?: { key: string; asc?: boolean };
  pagenation?: {
    rowCountPerPage?: 20 | 50 | 100 | "all";
  };
};
```

##### onClickRow

In `onClickRow`, you may define the behavior when a row is clicked. This is optional.

```ts
type TOnClickRow = (row: DataObject) => void;
```

##### onUpdateRow

In `onUpdateRow`, You can define the behavior when you paste data from Excel or spreadsheets into a table. This is optional.
For multi-line data, this function is executed one line at a time.

```ts
type TOnUpdateRow = (newRow: DataObject, oldRow: DataObject) => void;
```

##### applyRowFormatting

In `applyRowFormatting`, depending on the status of each row, you can define the format of the row using TailwindCSS classes. In principle, TailwindCSS classes other than background and text color are not guaranteed to work, but any class can be specified.

```ts
/**
 * The return value is a string of one TailwindCSS class or multiple TailwindCSS classes separated by spaces.
 */
type TApplyRowFormatting = (row: DataObject) => string;
```

##### checkbox

In `checkbox`, you can easily place a checkbox at the left edge of the table. If `checkbox` is not defined, no checkbox will appear at the left edge.

When defining a `checkbox`, the following three properties must be set.

1. checked: Function to determine if a checkbox is checked or not
2. onChecked: Function to define the behavior when a checkbox is checked
3. onUnchecked: Function to define the behavior when a checkbox is unchecked

```ts
type TCheckbox = {
  checked: (row: DataObject) => boolean;
  onChecked: (row: DataObject) => void;
  onUnchecked: (row: DataObject) => void;
};
```

##### conditionalFormattings

In `conditionalFormattings`, you can define the format of the cell based on the status of each row. The format is defined using TailwindCSS classes. In principle, TailwindCSS classes other than background and text color are not guaranteed to work, but any class can be specified.

```ts
type TConditionalFormatting = {
  condition: (row: DataObject) => boolean;
  key: string;
  style: string;
};
```

## License

This library is licensed under MIT license. See LICENSE file for more information.
