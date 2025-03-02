import { useIdContext } from "../id/provider";
import { IdGenerator } from "../lib";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { useOptionsWindow } from "../options-window";

interface IPropsSelectBoxFrame {
  open: () => void;
  close: () => void;
  children: React.ReactNode;
  no_icon?: boolean;
}

export function SelectBoxFrame(props: IPropsSelectBoxFrame) {
  const id = useIdContext();
  const { state } = useOptionsWindow();

  return (
    <div
      id={IdGenerator.generateIdSelectBoxFrame(id)}
      className="relative w-full"
    >
      <div
        onClick={(e) => {
          if (!state.isOpen) {
            props.open();
          }
        }}
      >
        {props.children}
      </div>
      {!props.no_icon && (
        <div
          className="absolute grid place-items-center h-full right-1 top-0"
          onClick={(e) => {
            e.stopPropagation();
            if (state.isOpen) {
              props.close();
            } else {
              props.open();
            }
          }}
        >
          <MdOutlineKeyboardArrowLeft
            className={`duration-300 ${state.isOpen ? "-rotate-90" : ""}`}
          />
        </div>
      )}
    </div>
  );
}
