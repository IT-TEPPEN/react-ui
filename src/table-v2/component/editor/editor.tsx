import { NumberCellInput } from "./number-input";
import { SelectCellInput } from "./select-input";
import { StringCellInput } from "./string-input";
import { useEditor } from "./hook";

export function Editor() {
  const { id, isEditing, type } = useEditor();

  if (!isEditing) return <></>;

  const cellElement = document.getElementById(id);
  const rect = cellElement?.getBoundingClientRect();

  const size = rect
    ? {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
      }
    : undefined;

  if (!size) return <></>;

  const tableElement = document.getElementById("table-frame");
  if (!tableElement) return <></>;
  const rectTable = tableElement.getBoundingClientRect();

  size.top -= rectTable.top - tableElement.scrollTop - window.scrollY;
  size.left -= rectTable.left - tableElement.scrollLeft - window.scrollX;

  return (
    <div
      className="absolute top-0 left-0 grid place-items-center z-10 pr-2"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      style={{
        width: size.width,
        height: size.height,
        top: size.top - 1,
        left: size.left,
      }}
    >
      {type === "string" && <StringCellInput />}
      {type === "number" && <NumberCellInput />}
      {type === "select" && <SelectCellInput />}
    </div>
  );
}
