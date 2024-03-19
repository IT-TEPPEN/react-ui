# React-UI (@teppen/)

This is a React component library that provides some useful UI elements for your web applications.

## Components

This library includes the following components:

- Table: A simple Table. (0.1.0 ～)

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

To use the React-UI library, add a `content` in `tailwind.config.js` to `". /node_modules/@teppen/react-ui/dist/**/*.js"`.

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
          { id: "1", name: "Taro", age: 30 },
          { id: "2", name: "Yoshiko", age: 60 },
          { id: "3", name: "Koki", age: 13 },
          { id: "4", name: "Chisato", age: 34 },
        ]}
        cols={[
          { key: "id", label: "ID", type: "数値" },
          { key: "name", label: "名前", type: "文字列" },
          { key: "age", label: "年齢", type: "数値" },
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
- Filtering function (only when `label` and `type` are set in the column information)
- Sorting function (only when `label` and `type` are set in the column information)

#### Arguments

The table component only accepts the arguments `rows` and `cols`. Details for each argument are described below.

##### rows

`rows` is an array of the following associative array (`DataObject`). Only id is required and it must be unique within the array. If onClick is set, it is possible to define the behavior when a row is clicked.

```ts
export type DataObject = {
  [key: string]: any;
  id: number | string;
  onClick?: React.MouseEventHandler<HTMLTableRowElement>;
};
```

##### cols

In `cols`, you specify the data to be displayed in the table from left to right. The `key` here needs to match the key name in each element of rows. However, it is not necessary to always include the key `id`. `label` and `type` are optional, but they are required for some functions, so it is recommended to set them.

```ts
export type TColumnType = "string" | "number";

export type TTableColumn = { key: string; label?: string; type?: TColumnType };
```

## License

This library is licensed under MIT license. See LICENSE file for more information.

```

```
