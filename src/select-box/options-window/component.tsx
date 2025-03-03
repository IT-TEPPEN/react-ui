import { useEffect, useState } from "react";
import { useOptionsWindow } from "../options-window";
import { useIdContext } from "../id/provider";
import { IdGenerator } from "../lib";

export function OptionsArea() {
  const id = useIdContext();
  const { state, actions } = useOptionsWindow();
  const [value, setValue] = useState("");
  const [selectingIndex, setSelectingIndex] = useState<number | undefined>(
    undefined
  );

  const selectingValue = state.isOpen
    ? state.options.length === 0
      ? undefined
      : typeof selectingIndex === "number" &&
        selectingIndex < state.options.length &&
        selectingIndex >= 0
      ? state.options[selectingIndex].value
      : undefined
    : undefined;

  useEffect(() => {
    if (state.isOpen) {
      const optionElement = document.getElementById(
        IdGenerator.generateIdSelectBoxOption(id, selectingValue ?? "")
      );

      if (!optionElement) return;

      optionElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    } else {
      setSelectingIndex(undefined);
    }
  }, [state]);

  useEffect(() => {
    if (state.isOpen) {
      const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectingIndex((prev) =>
            typeof prev === "number"
              ? Math.min(prev + 1, state.options.length - 1)
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
            if (
              state.options.length === 0 ||
              state.options.length <= selectingIndex
            )
              return;

            const value = state.options[selectingIndex].value;

            if (!value) return;

            setValue(value);
            state.onSelect(value);
            actions.closeOptionsWindow();
          }
        }
      };

      document.addEventListener("keydown", handleKeydown);

      return () => {
        document.removeEventListener("keydown", handleKeydown);
      };
    }
  }, [state, selectingIndex, setSelectingIndex]);

  if (!state.isOpen) return <></>;

  // state.selectBoxIdのElementの直下に表示する
  const selectBoxElement = document.getElementById(state.selectBoxId);

  if (!selectBoxElement) return <></>;

  const rect = selectBoxElement.getBoundingClientRect();
  let top = window.scrollY + rect.top + rect.height;
  let left = window.scrollX + rect.left;

  return (
    <div
      id={"ReactUI:SelectBox:OptionsArea"}
      className="absolute min-w-fit max-h-[40vh] overflow-auto border border-gray-300 z-10"
      style={{ top, left }}
    >
      {state.options.map((option) => (
        <div
          id={IdGenerator.generateIdSelectBoxOption(id, option.value ?? "")}
          className={`hover:bg-gray-200 px-2 py-1 ${
            typeof selectingValue === "string"
              ? selectingValue === option.value
                ? "bg-gray-100"
                : "bg-white"
              : value === option.value
              ? "bg-gray-100"
              : "bg-white"
          }`}
          key={option.value}
          onClick={() => {
            state.onSelect(option.value);
            actions.closeOptionsWindow();
          }}
        >
          {option.searchLabel ?? option.label}
        </div>
      ))}
    </div>
  );
}
