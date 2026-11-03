import { useEffect, useRef, useState } from "react";
import { useIdContext } from "../id/provider";
import { IdGenerator } from "../lib";
import { useOptionsWindow } from "./context";

export function OptionsArea() {
  const id = useIdContext();
  const { state, actions } = useOptionsWindow();
  const [value, setValue] = useState("");
  const [selectingIndex, setSelectingIndex] = useState<number | undefined>(
    undefined
  );
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // The first option is chosen until the user moves, so Enter alone picks
  // it (the list is filtered as the user types).
  const activeIndex =
    typeof selectingIndex === "number" &&
    selectingIndex < (state.isOpen ? state.options.length : 0) &&
    selectingIndex >= 0
      ? selectingIndex
      : 0;
  const selectingValue = state.isOpen
    ? state.options.length === 0
      ? undefined
      : state.options[activeIndex].value
    : undefined;

  // Typing filters the list: start again from its first option.
  const searchText = state.isOpen ? state.searchText : "";
  useEffect(() => {
    setSelectingIndex(undefined);
  }, [searchText]);

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
        // Keys that confirm or cancel IME conversion (e.g. Japanese) are not
        // meant for the list.
        if (e.isComposing || e.keyCode === 229) return;

        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectingIndex(() =>
            Math.min(activeIndex + 1, state.options.length - 1)
          );
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectingIndex(() => Math.max(activeIndex - 1, 0));
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (state.options.length === 0) return;

          // "" is a valid value (e.g. the option that clears the cell).
          const value = state.options[activeIndex].value;

          if (typeof value !== "string") return;

          setValue(value);
          state.onSelect(value, state.searchText);
          actions.closeOptionsWindow();
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
  }, [state, selectingIndex, activeIndex, setSelectingIndex, actions]);

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
      className="absolute min-w-fit max-h-[40vh] overflow-auto border border-[color:var(--teppen-table-control-border,#d1d5db)] z-10"
      style={position}
    >
      {state.options.map((option) => (
        <div
          id={IdGenerator.generateIdSelectBoxOption(id, option.value ?? "")}
          className={`hover:bg-[color:var(--teppen-table-hover,#e5e7eb)] px-2 py-1 ${
            typeof selectingValue === "string"
              ? selectingValue === option.value
                ? "bg-[color:var(--teppen-table-active,rgb(36_89_214/0.1))]"
                : "bg-[color:var(--teppen-table-bg,#ffffff)]"
              : value === option.value
              ? "bg-[color:var(--teppen-table-active,rgb(36_89_214/0.1))]"
              : "bg-[color:var(--teppen-table-bg,#ffffff)]"
          }`}
          key={option.value}
          onClick={() => {
            state.onSelect(option.value, state.searchText);
            actions.closeOptionsWindow();
          }}
        >
          {option.searchLabel ?? option.label}
        </div>
      ))}
    </div>
  );
}
