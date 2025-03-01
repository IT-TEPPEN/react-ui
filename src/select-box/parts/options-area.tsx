import { useEffect } from "react";
import { Options } from "../types";
import { useIdContext } from "../id/provider";
import { IdGenerator } from "../lib";

interface IPropsSelectArea {
  options: Options[];
  value: string;
  onSelect: (value: string) => void;
  selectingValue?: string;
}

export function OptionsArea(props: IPropsSelectArea) {
  const id = useIdContext();

  useEffect(() => {
    const optionElement = document.getElementById(
      IdGenerator.generateIdSelectBoxOption(id, props.selectingValue ?? "")
    );

    if (!optionElement) return;

    optionElement.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [props.selectingValue]);

  return (
    <div
      id={IdGenerator.generateIdSelectBoxOptionsArea(id)}
      className="absolute top-full left-0 w-full max-h-[40vh] overflow-auto border border-gray-300 z-10"
    >
      {props.options.map((option) => (
        <div
          id={IdGenerator.generateIdSelectBoxOption(id, option.value ?? "")}
          className={`hover:bg-gray-200 px-2 py-1 ${
            typeof props.selectingValue === "string"
              ? props.selectingValue === option.value
                ? "bg-gray-100"
                : "bg-white"
              : props.value === option.value
              ? "bg-gray-100"
              : "bg-white"
          }`}
          key={option.value}
          onClick={() => props.onSelect(option.value)}
        >
          {option.searchLabel ?? option.label}
        </div>
      ))}
    </div>
  );
}
