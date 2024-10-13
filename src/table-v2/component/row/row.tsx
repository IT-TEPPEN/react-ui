import { memo } from "react";
import { useRow } from "./hook";
import { Cell } from "../cell/cell";

type TPropsRow = {
  rowIndex: number;
};

export const Row = memo(function R(props: TPropsRow) {
  const { colLength, onClick, rowDesign } = useRow(props.rowIndex);

  return (
    <tr
      className={`relative border border-gray-200 after:absolute after:w-full after:h-full after:top-0 after:left-0 after:pointer-events-none after:hover:bg-gray-500/10 ${rowDesign}`}
      onClick={onClick}
    >
      {/* {props.existCheckbox && (
        <td>
          <Checkbox row={row} />
        </td>
      )} */}
      {[...Array(colLength)].map((_, j) => {
        return <Cell key={j} rowIndex={props.rowIndex} colIndex={j} />;
      })}
    </tr>
  );
});
