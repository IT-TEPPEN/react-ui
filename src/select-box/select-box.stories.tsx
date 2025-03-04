import type { Meta, StoryObj } from "@storybook/react";
import { SelectBox } from ".";
import { useState } from "react";

function TestSelectBox(props: Parameters<typeof SelectBox>[0]) {
  const [value, setValue] = useState("");

  return (
    <SelectBox
      {...props}
      value={value}
      onSelect={(v) => {
        setValue(v);
      }}
    />
  );
}

const meta = {
  title: "SelectBox/Base",
  component: TestSelectBox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} as Meta<typeof TestSelectBox>;

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
  },
};

export const UseSearchLabelAndSearchText: Story = {
  args: {
    id: "select-box",
    options: [
      {
        value: "apple",
        label: "りんご",
        searchLabel: "りんご(Apple)",
        searchText: "Appleりんごリンゴ林檎",
      },
      {
        value: "orange",
        label: "みかん",
        searchLabel: "みかん(Orange)",
        searchText: "Orangeみかんミカン蜜柑",
      },
      {
        value: "grape",
        label: "ぶどう",
        searchLabel: "ぶどう(Grape)",
        searchText: "Grapeぶどうブドウ葡萄",
      },
      {
        value: "banana",
        label: "バナナ",
        searchLabel: "バナナ(Banana)",
        searchText: "Bananaばななバナナ",
      },
      {
        value: "peach",
        label: "もも",
        searchLabel: "もも(Peach)",
        searchText: "Peachももモモ桃",
      },
      {
        value: "melon",
        label: "メロン",
        searchLabel: "メロン(Melon)",
        searchText: "Melonめろんメロン",
      },
      {
        value: "strawberry",
        label: "いちご",
        searchLabel: "いちご(Strawberry)",
        searchText: "Strawberryいちごイチゴ苺",
      },
      {
        value: "kiwi",
        label: "キウイ",
        searchLabel: "キウイ(Kiwi)",
        searchText: "Kiwiきういキウイ",
      },
      {
        value: "pineapple",
        label: "パイナップル",
        searchLabel: "パイナップル(Pineapple)",
        searchText: "Pineappleぱいなっぷるパイナップル",
      },
      {
        value: "cherry",
        label: "さくらんぼ",
        searchLabel: "さくらんぼ(Cherry)",
        searchText: "Cherryさくらんぼサクランボ",
      },
      {
        value: "pear",
        label: "なし",
        searchLabel: "なし(Pear)",
        searchText: "Pearなしナシ梨",
      },
      {
        value: "lemon",
        label: "レモン",
        searchLabel: "レモン(Lemon)",
        searchText: "Lemonれもんレモン檸檬",
      },
      {
        value: "blueberry",
        label: "ブルーベリー",
        searchLabel: "ブルーベリー(Blueberry)",
        searchText: "Blueberryぶるーべりーブルーベリー",
      },
      {
        value: "mango",
        label: "マンゴー",
        searchLabel: "マンゴー(Mango)",
        searchText: "Mangoまんごーマンゴー",
      },
      {
        value: "watermelon",
        label: "スイカ",
        searchLabel: "スイカ(Watermelon)",
        searchText: "Watermelonすいかスイカ",
      },
      {
        value: "papaya",
        label: "パパイヤ",
        searchLabel: "パパイヤ(Papaya)",
        searchText: "Papayaぱぱいやパパイヤ",
      },
      {
        value: "fig",
        label: "いちじく",
        searchLabel: "いちじく(Fig)",
        searchText: "Figいちじくイチジク無花果",
      },
      {
        value: "persimmon",
        label: "柿",
        searchLabel: "柿(Persimmon)",
        searchText: "Persimmonかきカキ柿",
      },
      {
        value: "plum",
        label: "プラム",
        searchLabel: "プラム(Plum)",
        searchText: "Plumぷらむプラム",
      },
      {
        value: "apricot",
        label: "杏",
        searchLabel: "杏(Apricot)",
        searchText: "Apricotあんずアンズ杏",
      },
      {
        value: "peanut",
        label: "ピーナッツ",
        searchLabel: "ピーナッツ(Peanut)",
        searchText: "Peanutぴーなっつピーナッツ",
      },
      {
        value: "almond",
        label: "アーモンド",
        searchLabel: "アーモンド(Almond)",
        searchText: "Almondあーもんどアーモンド",
      },
      {
        value: "walnut",
        label: "くるみ",
        searchLabel: "くるみ(Walnut)",
        searchText: "Walnutくるみクルミ胡桃",
      },
      {
        value: "chestnut",
        label: "栗",
        searchLabel: "栗(Chestnut)",
        searchText: "Chestnutくりクリ栗",
      },
      {
        value: "hazelnut",
        label: "ヘーゼルナッツ",
        searchLabel: "ヘーゼルナッツ(Hazelnut)",
        searchText: "Hazelnutへーぜるなっつヘーゼルナッツ",
      },
      {
        value: "cashew",
        label: "カシューナッツ",
        searchLabel: "カシューナッツ(Cashew)",
        searchText: "Cashewかしゅーなっつカシューナッツ",
      },
      {
        value: "macadamia",
        label: "マカダミアナッツ",
        searchLabel: "マカダミアナッツ(Macadamia)",
        searchText: "Macadamiaまかだみあなっつマカダミアナッツ",
      },
      {
        value: "pistachio",
        label: "ピスタチオ",
        searchLabel: "ピスタチオ(Pistachio)",
        searchText: "Pistachioぴすたちおピスタチオ",
      },
      {
        value: "pecan",
        label: "ペカン",
        searchLabel: "ペカン(Pecan)",
        searchText: "Pecanぺかんペカン",
      },
    ],
  },
};
