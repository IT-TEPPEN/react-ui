import plugin from "tailwindcss/plugin";
import { colorObject } from "./theme";

const basePlugin = plugin(function ({}) {}, {
  theme: {
    extend: {
      colors: {
        ...colorObject,
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
});

export default basePlugin;
