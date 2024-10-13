import { memo } from "react";
import { useCell, useCellFrame } from "./hook";
import { EditButton } from "./edit-button";

interface TPropsCell {
  rowIndex: number;
  colIndex: number;
}

export const Cell = memo(function C(props: TPropsCell) {
  const {
    id,
    editable,
    type,
    design,
    isExistOnClickRow,
    onClickCell,
    onDoubleClick,
  } = useCellFrame(props.rowIndex, props.colIndex);

  return (
    <td
      id={id}
      className={design}
      onClick={!isExistOnClickRow ? onClickCell : undefined}
      onDoubleClick={!isExistOnClickRow ? onDoubleClick : undefined}
    >
      <div
        className={`flex items-center gap-3 w-fit p-2 cursor-default`}
        onClick={onClickCell}
      >
        {type === "component" ? (
          <CellData {...props} />
        ) : (
          <div onDoubleClick={onDoubleClick}>
            <p className="cell-data text-left whitespace-nowrap">
              <CellData {...props} />
            </p>
          </div>
        )}
        {editable && <EditButton />}
      </div>
    </td>
  );
});

interface TPropsCellData {
  rowIndex: number;
  colIndex: number;
}

export const CellData = memo(function CD(props: TPropsCellData) {
  const { component } = useCell(props.rowIndex, props.colIndex);

  return <>{component}</>;
});
