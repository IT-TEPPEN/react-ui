import { useEffect } from "react";
import { Options } from "../options-window";
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
      className="absolute top-full left-0 w-full max-h-[40vh] overflow-auto border border-[color:var(--teppen-table-control-border,#d1d5db)] z-10"
    >
      {props.options.map((option) => (
        <div
          id={IdGenerator.generateIdSelectBoxOption(id, option.value ?? "")}
          className={`hover:bg-[color:var(--teppen-table-hover,#e5e7eb)] px-2 py-1 ${
            typeof props.selectingValue === "string"
              ? props.selectingValue === option.value
                ? "bg-[color:var(--teppen-table-active,#f3f4f6)]"
                : "bg-[color:var(--teppen-table-bg,#ffffff)]"
              : props.value === option.value
              ? "bg-[color:var(--teppen-table-active,#f3f4f6)]"
              : "bg-[color:var(--teppen-table-bg,#ffffff)]"
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
