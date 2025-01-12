import { useIdContext } from "../id/provider";
import { IdGenerator } from "../lib";

interface IPropsSelectBoxFrame {
  onToggle: () => void;
  isOpen: boolean;
  children: React.ReactNode;
}

export function SelectBoxFrame(props: IPropsSelectBoxFrame) {
  const id = useIdContext();

  return (
    <div id={IdGenerator.generateIdSelectBoxFrame(id)} className="relative">
      <div
        onClick={(e) => {
          if (!props.isOpen) {
            props.onToggle();
          }
        }}
      >
        {props.children}
      </div>
      <div
        className="absolute grid place-items-center h-full right-1 top-0"
        onClick={(e) => {
          e.stopPropagation();
          props.onToggle();
        }}
      >
        {props.isOpen ? <>閉</> : <>開</>}
      </div>
    </div>
  );
}
