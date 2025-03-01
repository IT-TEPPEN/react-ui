"use client";

import { useIdContext } from "../id/provider";
import { IdGenerator } from "../lib";

interface IPropsInputArea {
  inputRef?: React.RefObject<HTMLInputElement>;
  isSelecting: boolean;
  selectedValue: string;
  searchText: string;
  onChangeSearchText: (value: string) => void;
  no_appearance?: boolean;
  placeholder?: string;
}

export function InputArea(props: IPropsInputArea) {
  const id = useIdContext();

  return (
    <input
      id={IdGenerator.generateIdSelectBoxInputArea(id)}
      ref={props.inputRef}
      className={`border border-gray-300 px-2 py-1 w-full ${
        props.no_appearance
          ? "no_appearance border-none p-2 focus:outline-none focus-visible:outline-none bg-transparent"
          : ""
      }`}
      type="text"
      placeholder={
        props.selectedValue === ""
          ? props.placeholder ?? "選択してください"
          : props.selectedValue
      }
      value={props.isSelecting ? props.searchText : props.selectedValue}
      onChange={(e) => {
        e.preventDefault();
        props.onChangeSearchText(e.target.value);
      }}
    />
  );
}
