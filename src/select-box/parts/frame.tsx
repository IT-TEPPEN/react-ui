import { useIdContext } from "../id/provider";
import { IdGenerator } from "../lib";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";

interface IPropsSelectBoxFrame {
  onToggle: () => void;
  isOpen: boolean;
  children: React.ReactNode;
  no_icon?: boolean;
}

export function SelectBoxFrame(props: IPropsSelectBoxFrame) {
  const id = useIdContext();

  return (
    <div
      id={IdGenerator.generateIdSelectBoxFrame(id)}
      className="relative w-full"
    >
      <div
        onClick={(e) => {
          if (!props.isOpen) {
            props.onToggle();
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
            props.onToggle();
          }}
        >
          <MdOutlineKeyboardArrowLeft
            className={`duration-300 ${props.isOpen ? "-rotate-90" : ""}`}
          />
        </div>
      )}
    </div>
  );
}
