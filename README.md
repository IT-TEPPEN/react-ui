# React-UI

This is a React component library that provides some useful UI elements for your web applications.

## Components

This library includes the following components:

- Table: A simple Table. (1.0.0 ～) (※ Not compatible with 0.\*.\*)
- FileUploader: A drop area and file picker with file type and size checks.

## Installation

You can install this library using npm or yarn.

```bash
npm i @teppen/react-ui
```

This library has the following peer dependencies:

- react (18.2 or later, 19 supported)
- react-dom (18.2 or later, 19 supported)

### Tailwind CSS Installation and Setup

Please follow the installation procedure described in the following tailwindcss website.

- URL: https://tailwindcss.com/docs/installation/framework-guides

This library works with both Tailwind CSS v4 and v3. Tell Tailwind to scan the library's files so that the classes it uses are generated.

#### Tailwind CSS v4

Add an `@source` for the library to the CSS file that imports Tailwind CSS. The path is relative to that CSS file.

```css
@import "tailwindcss";
@source "../node_modules/@teppen/react-ui/dist";
```

#### Tailwind CSS v3

Add `"./node_modules/@teppen/react-ui/dist/**/*.js"` to `content` in `tailwind.config.js`.

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
          pagination: {
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
- Sorting function (`disableSort` turns it off for a column; columns with `render` need `disableSort: false`, see below)
- Filtering function (only when `label` is set in the column information; `disableFilter` turns it off for a column; columns with `render` need `disableFilter: false`)

Sorting compares numbers and dates by value and text in Japanese order (`"2"` before `"10"`, hiragana and katakana together in kana order). Select columns are sorted by their labels. Empty values stay at the end in both orders.
The search bar can also search every column at once ("すべての列" / "All columns", which looks in what each column shows, e.g. option labels), filter a select column by several values (`in` / `not in`), and combine conditions with OR instead of AND (the AND / OR button shown with two or more conditions).
The `like` / `not like` filters ignore differences between upper and lower case, full-width and half-width characters, and hiragana and katakana (`"tokyo"` matches `"Tokyo"`, `"とうきょう"` matches `"ﾄｳｷｮｳ"`). `=` and `≠` compare the text exactly.
- Editing function (only when `editable` is true and `onCellBlur` is set in the column information)
- Checkbox function
- Paste function
- Conditional formatting function

#### Arguments

The table component accepts the arguments `id`, `rows`, `cols`, `initialCondition`, `onClickRow`, `onUpdateRow`, `onPasteError`, `onConditionChange`, `errorHandler`, `locale`, `applyRowFormatting`, `checkbox`, `conditionalFormattings`, `maxHeight` and `maxWidth`. Details for each argument are described below.

All of these types are exported from the package, e.g. `import type { TTableColumn, TPropsTable } from "@teppen/react-ui";`.

##### id

`id` is used for the element ids inside the table. It is optional; without it, each table gets a unique id automatically.

##### rows

`rows` is an array of the following associative array (`DataObject`). Only id is required and it must be unique within the array.

```ts
export type DataObject = {
  [key: string]: number | string | Date;
  id: number | string;
};
```

The row objects you pass are given back unchanged to callbacks such as `onClickRow`, `onCellBlur` and `checkbox`, so `Date` values stay `Date` objects.

※ `onClick` property has been deprecated since version 1.0.0 in favor of the new Table argument `onClickRow`

##### cols

In `cols`, you specify the data to be displayed in the table from left to right. The `key` here needs to match the key name in each element of rows.

it is not necessary to always include the key `label`, but it is required for some functions, so it is recommended to set it.

```ts
export type TColumnType = "string" | "number" | "select" | "date" | "datetime";

export type TTableColumn = {
  key: string;
  label?: string;
  type: TColumnType;
  disableSort?: boolean;
  disableFilter?: boolean;
  options: { value: string; label: string }[]; // Only When "type" is "select"
  editable?: boolean;
  render?: (value: string | number, row: DataObject) => React.ReactNode; // Only When "editable" is false
  // When "type" is "date" or "datetime", "render" is required and "editable" must be false:
  // render: (value: Date) => React.ReactNode;
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
is now supported. A read-only column that uses `render` is not sorted or filtered by default, because what it shows may have nothing to do with its value in `rows` (for example, an id that a component uses to load and show a name). To sort or filter such a column by its value, set `disableSort: false` / `disableFilter: false` on it; the all-columns search then also looks at the text `render` returns, when it returns text.

```tsx
// Sorted and filtered by the value 80, shown as "80点"
{ key: "score", type: "number", label: "評価", render: (v) => `${v}点`, disableSort: false, disableFilter: false }
```

##### initialCondition

In `initialCondition`, you can set initial values for each function. This is optional.

```ts
type TInitialCondition = {
  sort?: { key: string; asc?: boolean };
  filters?: TFilter[]; // filters applied on the first render
  filterMode?: "and" | "or"; // how filters are combined (default "and")
  pagination?: {
    rowCountPerPage?: 20 | 50 | 100 | "all";
  };
};
```

A filter is written as follows. `key` is a column key, or `"*"` to search every column (`like` / `not_like` only).

```ts
type TFilter = {
  key: string;
  operator:
    | "eq" | "neq" | "like" | "not_like"
    | "gt" | "gte" | "lt" | "lte"
    | "is_null" | "is_not_null"
    | "in" | "not_in"; // in / not_in: select columns
  value?: string | number | Date | string[]; // string[] for in / not_in
};

// Example
initialCondition={{
  filters: [
    { key: "role", operator: "in", value: ["1", "2"] },
    { key: "age", operator: "gte", value: 30 },
    { key: "*", operator: "like", value: "tokyo" },
  ],
}}
```

Filters that do not fit the column (unknown key, operator or value) are ignored with a console warning.

※ `pagenation` (the earlier spelling) still works but is deprecated. If both are set, `pagination` is used.

`rowCountPerPage` defaults to 50. With pagination, the table stays fast regardless of the number of rows (all operations took under 50 ms with 10,000 rows in our measurements). `"all"` renders every row at once, so it gets slower as rows increase: with 1,000 rows sorting takes about 0.6 s, and with 10,000 rows the first render and sorting take several seconds. For more than about 1,000 rows, use pagination.

##### onConditionChange

`onConditionChange` is called with the current filters and sort, and the rows that pass the filters in the shown order (all pages, not only the current page). It is called when the table first renders and whenever the filters, the sort or the rows change. This is optional.

```ts
type TOnConditionChange = (
  condition: {
    filters: TFilter[];
    filterMode: "and" | "or";
    sort: { key: string; asc: boolean };
  },
  rows: DataObject[]
) => void;
```

`condition` has the same shape as `initialCondition`, so it can be saved (e.g. in localStorage or the URL) and passed back as `initialCondition` to restore the view. `rows` can be used for showing the number of matching rows or exporting them.

```tsx
const saved = JSON.parse(localStorage.getItem("table") ?? "null");

<Table
  rows={rows}
  cols={cols}
  initialCondition={saved ?? undefined}
  onConditionChange={(condition, shownRows) => {
    localStorage.setItem("table", JSON.stringify(condition));
    setCount(shownRows.length);
  }}
/>;
```

※ Date values in saved filters become strings in JSON; they are read back as dates.

##### onClickRow

In `onClickRow`, you may define the behavior when a row is clicked. This is optional.

```ts
type TOnClickRow = (row: DataObject) => void;
```

##### onUpdateRow

In `onUpdateRow`, You can define the behavior when you paste data from Excel or spreadsheets into a table. This is optional.
For multi-line data, this function is executed one line at a time.
Pasted data is read as tab-separated cells, as copied from Excel or Google Sheets. For number columns, values such as `1,000` are accepted.

```ts
type TOnUpdateRow = (newRow: DataObject, oldRow: DataObject) => void;
```

##### onPasteError

In `onPasteError`, you can handle pasted data that cannot be applied, for example when it does not fit in the table or targets a column that is not editable. This is optional; if it is not set, the message is shown with `window.alert`.
Invalid values are reported to `errorHandler` instead.

```ts
type TOnPasteError = (error: {
  type: "NOT_ENOUGH_ROWS" | "NOT_ENOUGH_COLUMNS" | "NOT_EDITABLE_COLUMN";
  message: string;
}) => void;
```

##### errorHandler

In `errorHandler`, you can handle values that break a column's `constraints` (when editing a cell or pasting). This is optional; if it is not set, the errors are shown with `window.alert`.

```ts
type TErrorHandler = (errors: TErrorValidation[]) => void;
```

##### locale

`locale` sets the language of the messages the table shows by itself: the default `errorHandler` alert, paste error messages, the "copied" notice and the empty option of select cells. `"ja"` (default) or `"en"`.

```ts
type TLocale = "ja" | "en";
```

##### maxHeight / maxWidth

CSS sizes (e.g. `"600px"`) that limit the table area. The table scrolls inside it.

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

### FileUploader Component

A drop area that also opens the file picker when clicked.

```tsx
import { FileUploader } from "@teppen/react-ui";

<FileUploader
  allowedExtensions={[".pdf", ".xlsx"]}
  maxFileSize={10 * 1024 * 1024}
  onFilesAdded={(files) => console.log(files)}
  onFilesRejected={(files) => console.log("rejected", files)}
/>;
```

Files are checked as follows:

- With only `allowedExtensions`, only the extension is checked. With only `acceptedFileTypes` (MIME types such as `"image/*"`), only the MIME type is checked.
- With neither or both, a file is accepted if it matches either list. The defaults cover common images, Office documents, PDF, text and archives.
- Files larger than `maxFileSize` (bytes) are rejected.

For a custom UI, use the `useFileUploader` hook, which returns the props for the drop area and the hidden file input.

## Breaking changes since 1.10.2

- Table callbacks (`onClickRow`, `applyRowFormatting`, `checkbox`, `onCellBlur`, `onUpdateRow`) receive the row objects passed in `rows` as they are. Before, some of them received copies in which `Date` values had become ISO strings.
- FileUploader: when only `allowedExtensions` or only `acceptedFileTypes` is given, files are checked against that list alone. Before, files that matched the other (default) list were also accepted.
- Read-only columns without `render` can now be sorted and filtered. Use `disableSort` / `disableFilter` to turn this off.
- Copying a `datetime` cell gives `YYYY-MM-DD HH:mm:ss` in local time instead of an ISO string in UTC.
- Pasted text is split only on tabs, so a value such as `a,b` stays in one cell.

## License

This library is licensed under MIT license. See LICENSE file for more information.
