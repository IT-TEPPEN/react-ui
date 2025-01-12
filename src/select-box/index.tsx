import { useEffect, useMemo, useState } from "react";
import { InputArea, OptionsArea, SelectBoxFrame } from "./parts";
import { Options } from "./types";
import { IdProvider } from "./id/provider";
import { IdGenerator } from "./lib";

interface IPropsSelectBox {
  id: string;
  inputRef?: React.RefObject<HTMLInputElement>;
  defaultIsOpen?: boolean;
  options: Options[];
  value?: string;
  onSelect: (value: string) => void;
}

export function SelectBox(props: IPropsSelectBox) {
  const [value, setValue] = useState(props.value ?? "");
  const [isOpen, setIsOpen] = useState(props.defaultIsOpen ?? false);
  const [searchText, setSearchText] = useState("");
  const [selectingIndex, setSelectingIndex] = useState<number | undefined>(
    undefined
  );

  const handleSelect = (value: string) => {
    setValue(value);
    props.onSelect(value);
    setSearchText("");
    setIsOpen(false);
  };

  const label =
    props.options.find((option) => option.value === value)?.label ?? "";

  const searchedOptions = useMemo(
    () =>
      props.options.filter((option) =>
        option.label.toLowerCase().includes(searchText.toLowerCase())
      ),
    [props.options, searchText]
  );

  useEffect(() => {
    const onClickOutOfSelectBox = (e: MouseEvent) => {
      // SelectBox関連の要素を取得
      const frameElement = document.getElementById(
        IdGenerator.generateIdSelectBoxFrame(props.id)
      );
      const optionsElement = document.getElementById(
        IdGenerator.generateIdSelectBoxOptionsArea(props.id)
      );

      // クリックされた要素を取得
      const ele = e.target;

      if (ele instanceof Node && frameElement?.contains(ele)) return;
      if (ele instanceof Node && optionsElement?.contains(ele)) return;

      setSearchText("");
      setIsOpen(false);
    };

    document.addEventListener("mousedown", onClickOutOfSelectBox);

    return () => {
      document.removeEventListener("mousedown", onClickOutOfSelectBox);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSelectingIndex(undefined);

      const inputElement = document.getElementById(
        IdGenerator.generateIdSelectBoxInputArea(props.id)
      );

      if (inputElement) {
        // inputElementにフォーカスされている場合、ArrowDownを押すとOptionsAreaが開く
        const handleKeydown = (e: KeyboardEvent) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setIsOpen(true);
          }
        };
        inputElement.addEventListener("keydown", handleKeydown);

        return () => {
          inputElement.removeEventListener("keydown", handleKeydown);
        };
      }
    } else {
      const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectingIndex((prev) =>
            typeof prev === "number"
              ? Math.min(prev + 1, searchedOptions.length - 1)
              : 0
          );
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectingIndex((prev) =>
            typeof prev === "number" ? Math.max(prev - 1, 0) : 0
          );
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (typeof selectingIndex === "number") {
            handleSelect(searchedOptions[selectingIndex].value);
          }
        }
      };
      document.addEventListener("keydown", handleKeydown);

      return () => {
        document.removeEventListener("keydown", handleKeydown);
      };
    }
  }, [isOpen, searchedOptions, selectingIndex, setSelectingIndex]);

  const selectingValue =
    searchedOptions.length === 0
      ? undefined
      : typeof selectingIndex === "number" &&
        selectingIndex < searchedOptions.length
      ? searchedOptions[selectingIndex].value
      : undefined;

  return (
    <IdProvider id={props.id}>
      <SelectBoxFrame
        isOpen={isOpen}
        onToggle={() => setIsOpen((prev) => !prev)}
      >
        <InputArea
          inputRef={props.inputRef}
          isSelecting={isOpen}
          selectedValue={label}
          searchText={searchText}
          onChangeSearchText={setSearchText}
        />
        {isOpen && (
          <OptionsArea
            options={searchedOptions}
            value={value}
            onSelect={handleSelect}
            selectingValue={selectingValue}
          />
        )}
      </SelectBoxFrame>
    </IdProvider>
  );
}
