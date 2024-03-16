type TPropsCell = {
  children: React.ReactNode;
};

export function TableCell(props: TPropsCell) {
  return (
    <td>
      <div
        className={"p-2 w-fit text-left cursor-default"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {props.children}
      </div>
    </td>
  );
}
