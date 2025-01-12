"use client";

interface IPropsInputArea {
  inputRef?: React.RefObject<HTMLInputElement>;
  isSelecting: boolean;
  selectedValue: string;
  searchText: string;
  onChangeSearchText: (value: string) => void;
}

export function InputArea(props: IPropsInputArea) {
  return (
    <input
      ref={props.inputRef}
      className="border border-gray-300 px-2 py-1"
      type="text"
      placeholder={
        props.selectedValue === "" ? "選択してください" : props.selectedValue
      }
      value={props.isSelecting ? props.searchText : props.selectedValue}
      onChange={(e) => {
        e.preventDefault();
        props.onChangeSearchText(e.target.value);
      }}
    />
  );
}
