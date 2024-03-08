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

For example, to use the Button component, you can do something like this:

```tsx
import React from "react";
import { Table } from "@teppen/react-ui";

const App = () => {
  return (
    <div>
      <Table
        rows={[
          { id: "1", name: "Taro" },
          { id: "2", name: "Yoshiko" },
          { id: "3", name: "Koki" },
          { id: "4", name: "Chisato" },
        ]}
        cols={[
          { key: "id", label: "ID" },
          { key: "name", label: "名前" },
        ]}
      />
    </div>
  );
};

export default App;
```

## License

This library is licensed under MIT license. See LICENSE file for more information.
