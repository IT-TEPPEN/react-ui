import type { Meta, StoryObj } from "@storybook/react";
import { SelectBox } from ".";

const meta = {
  title: "SelectBox/Base",
  component: SelectBox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} as Meta<typeof SelectBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: "select-box",
    options: [
      { value: "apple", label: "りんご" },
      { value: "orange", label: "みかん" },
      { value: "grape", label: "ぶどう" },
      { value: "banana", label: "バナナ" },
      { value: "peach", label: "もも" },
      { value: "melon", label: "メロン" },
      { value: "strawberry", label: "いちご" },
      { value: "kiwi", label: "キウイ" },
      { value: "pineapple", label: "パイナップル" },
      { value: "cherry", label: "さくらんぼ" },
      { value: "pear", label: "なし" },
      { value: "lemon", label: "レモン" },
      { value: "blueberry", label: "ブルーベリー" },
      { value: "mango", label: "マンゴー" },
      { value: "watermelon", label: "スイカ" },
      { value: "papaya", label: "パパイヤ" },
      { value: "fig", label: "いちじく" },
      { value: "persimmon", label: "柿" },
      { value: "plum", label: "プラム" },
      { value: "apricot", label: "杏" },
      { value: "peanut", label: "ピーナッツ" },
      { value: "almond", label: "アーモンド" },
      { value: "walnut", label: "くるみ" },
      { value: "chestnut", label: "栗" },
      { value: "hazelnut", label: "ヘーゼルナッツ" },
      { value: "cashew", label: "カシューナッツ" },
      { value: "macadamia", label: "マカダミアナッツ" },
      { value: "pistachio", label: "ピスタチオ" },
      { value: "pecan", label: "ペカン" },
    ],
    onSelect: (value: string) => {
      console.log(value);
    },
  },
};
