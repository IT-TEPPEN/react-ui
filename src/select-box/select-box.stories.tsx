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

export const English: Story = {
  args: {
    id: "select-box",
    options: [
      { value: "apple", label: "Apple" },
      { value: "orange", label: "Orange" },
      { value: "grape", label: "Grape" },
      { value: "banana", label: "Banana" },
      { value: "peach", label: "Peach" },
      { value: "melon", label: "Melon" },
      { value: "strawberry", label: "Strawberry" },
      { value: "kiwi", label: "Kiwi" },
      { value: "pineapple", label: "Pineapple" },
      { value: "cherry", label: "Cherry" },
      { value: "pear", label: "Pear" },
      { value: "lemon", label: "Lemon" },
      { value: "blueberry", label: "Blueberry" },
      { value: "mango", label: "Mango" },
      { value: "watermelon", label: "Watermelon" },
      { value: "papaya", label: "Papaya" },
      { value: "fig", label: "Fig" },
      { value: "persimmon", label: "Persimmon" },
      { value: "plum", label: "Plum" },
      { value: "apricot", label: "Apricot" },
      { value: "peanut", label: "Peanut" },
      { value: "almond", label: "Almond" },
      { value: "walnut", label: "Walnut" },
      { value: "chestnut", label: "Chestnut" },
      { value: "hazelnut", label: "Hazelnut" },
      { value: "cashew", label: "Cashew" },
      { value: "macadamia", label: "Macadamia" },
      { value: "pistachio", label: "Pistachio" },
      { value: "pecan", label: "Pecan" },
    ],
    onSelect: (value: string) => {
      console.log(value);
    },
  },
};
