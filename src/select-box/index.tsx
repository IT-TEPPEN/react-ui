import { useEffect, useState } from "react";
import { InputArea, OptionsArea, SelectBoxFrame } from "./parts";
import { Options } from "./types";
import { ID_SELECT_BOX_FRAME, ID_SELECT_BOX_OPTIONS_AREA } from "./constants";

interface IPropsSelectBox {
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

  const handleSelect = (value: string) => {
    setValue(value);
    props.onSelect(value);
    setSearchText("");
    setIsOpen(false);
  };

  const label =
    props.options.find((option) => option.value === value)?.label ?? "";

  const searchedOptions = props.options.filter((option) =>
    option.label.includes(searchText)
  );

  useEffect(() => {
    const onClickOutOfSelectBox = (e: MouseEvent) => {
      // SelectBox関連の要素を取得
      const frameElement = document.getElementById(ID_SELECT_BOX_FRAME);
      const optionsElement = document.getElementById(
        ID_SELECT_BOX_OPTIONS_AREA
      );

      // クリックされた要素を取得
      const ele = e.target;

      if (ele instanceof Node && frameElement?.contains(ele)) return;
      if (ele instanceof Node && optionsElement?.contains(ele)) return;

      setIsOpen(false);
    };

    document.addEventListener("mousedown", onClickOutOfSelectBox);

    return () => {
      document.removeEventListener("mousedown", onClickOutOfSelectBox);
    };
  }, []);

  return (
    <>
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
          />
        )}
      </SelectBoxFrame>
    </>
  );
}
