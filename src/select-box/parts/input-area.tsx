"use client";

import { useEffect, useMemo, useState } from "react";
import { useIdContext } from "../id/provider";
import { IdGenerator } from "../lib";
import { Options, useOptionsWindow } from "../options-window";

interface IPropsInputArea {
  id: string;
  inputRef?: React.RefObject<HTMLInputElement>;
  open: () => void;
  close: () => void;
  options: Options[];
  no_appearance?: boolean;
  placeholder?: string;
  value?: string;
}

export function InputArea(props: IPropsInputArea) {
  const id = useIdContext();
  const { state, actions } = useOptionsWindow();
  const [searchText, setSearchText] = useState("");

  const searchedOptions = useMemo(
    () =>
      props.options.filter((option) => {
        if (option.searchText) {
          return option.searchText
            .toLowerCase()
            .includes(searchText.toLowerCase());
        } else if (option.searchLabel) {
          return option.searchLabel
            .toLowerCase()
            .includes(searchText.toLowerCase());
        } else {
          return option.label.toLowerCase().includes(searchText.toLowerCase());
        }
      }),
    [props.options, searchText]
  );

  useEffect(() => {
    if (state.isOpen) {
      actions.setSearchText(state.searchText);
    }
  }, [state]);

  useEffect(() => {
    const onClickOutOfSelectBox = (e: MouseEvent) => {
      if (!state.isOpen) return;

      // SelectBox関連の要素を取得
      const frameElement = document.getElementById(
        IdGenerator.generateIdSelectBoxFrame(props.id)
      );
      const optionsElement = document.getElementById(
        "ReactUI:SelectBox:OptionsArea"
      );

      // クリックされた要素を取得
      const ele = e.target;

      if (ele instanceof Node && frameElement?.contains(ele)) return;
      if (ele instanceof Node && optionsElement?.contains(ele)) return;

      setSearchText("");
      props.close();
    };

    document.addEventListener("mousedown", onClickOutOfSelectBox);

    return () => {
      document.removeEventListener("mousedown", onClickOutOfSelectBox);
    };
  }, [state]);

  useEffect(() => {
    if (!state.isOpen) {
      const inputElement = document.getElementById(
        IdGenerator.generateIdSelectBoxInputArea(props.id)
      );

      if (inputElement) {
        // inputElementにフォーカスされている場合、ArrowDownを押すとOptionsAreaが開く
        const handleKeydown = (e: KeyboardEvent) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            props.open();
          }
        };
        inputElement.addEventListener("keydown", handleKeydown);

        return () => {
          inputElement.removeEventListener("keydown", handleKeydown);
        };
      }
    }
  }, [state, searchedOptions]);

  const label =
    props.options.find((option) => option.value === props.value)?.label ?? "";

  return (
    <input
      id={IdGenerator.generateIdSelectBoxInputArea(id)}
      ref={props.inputRef}
      className={`px-2 py-1 ${
        props.no_appearance
          ? "no_appearance border-none focus:outline-none focus-visible:outline-none bg-transparent w-full"
          : "border border-gray-300 w-full"
      }`}
      type="text"
      placeholder={
        label === "" ? props.placeholder ?? "選択してください" : label
      }
      value={state.isOpen ? state.searchText : label}
      onChange={(e) => {
        e.preventDefault();
        actions.setSearchText(e.target.value);
      }}
    />
  );
}
