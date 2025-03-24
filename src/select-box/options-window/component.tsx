import { useEffect, useRef, useState } from "react";
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
  const [position, setPosition] = useState({ top: 0, left: 0 });

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
      if (position.top === 0 && position.left === 0) return;

      optionElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    } else {
      setSelectingIndex(undefined);
    }
  }, [state, position, selectingValue]);

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
        } else if (e.key === "Escape") {
          e.preventDefault();
          actions.closeOptionsWindow();
        }
      };

      document.addEventListener("keydown", handleKeydown);

      return () => {
        document.removeEventListener("keydown", handleKeydown);
      };
    }
  }, [state, selectingIndex, setSelectingIndex, actions]);

  useEffect(() => {
    const searchParentElement = () => {
      if (state.isOpen) {
        let parentElement = document.getElementById(
          "ReactUI:SelectBox:OptionsArea"
        )?.parentElement;

        const positionClasses = ["relative", "fixed", "absolute", "sticky"];

        while (parentElement) {
          const hasPositionClass = positionClasses.some((className) =>
            parentElement!.className.includes(className)
          );

          const hasPositionStyle = positionClasses.some((style) =>
            parentElement!.style.position.includes(style)
          );

          if (hasPositionClass || hasPositionStyle) break;

          parentElement = parentElement.parentElement;
        }

        const selectBoxElement = document.getElementById(state.selectBoxId);

        if (selectBoxElement) {
          const rect = selectBoxElement.getBoundingClientRect();
          let top = rect.top + rect.height;
          let left = rect.left;

          if (parentElement) {
            const parentRect = parentElement.getBoundingClientRect();
            setPosition({
              top: top - parentRect.top + parentElement.scrollTop,
              left: left - parentRect.left + parentElement.scrollLeft,
            });
          } else {
            setPosition({
              top: top + window.scrollY,
              left: left + window.scrollX,
            });
          }
        }
      }
    };

    const timer = setTimeout(searchParentElement, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [state.isOpen]);

  useEffect(() => {
    const onClickOutOfSelectBox = (e: MouseEvent) => {
      if (!state.isOpen) return;

      // SelectBox関連の要素を取得
      const frameElement = document.getElementById(state.selectBoxId);
      const optionsElement = document.getElementById(
        "ReactUI:SelectBox:OptionsArea"
      );

      // クリックされた要素を取得
      const ele = e.target;

      if (ele instanceof Node && frameElement?.contains(ele)) return;

      if (ele instanceof Node && optionsElement?.contains(ele)) return;

      actions.setSearchText("");
      actions.closeOptionsWindow();
    };

    document.addEventListener("mousedown", onClickOutOfSelectBox);

    return () => {
      document.removeEventListener("mousedown", onClickOutOfSelectBox);
    };
  }, [state.isOpen]);

  if (!state.isOpen) return <></>;

  return (
    <div
      id={"ReactUI:SelectBox:OptionsArea"}
      className="absolute min-w-fit max-h-[40vh] overflow-auto border border-gray-300 z-10"
      style={position}
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
