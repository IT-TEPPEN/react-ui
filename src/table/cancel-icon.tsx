import { MdOutlineCancel } from "react-icons/md";

type TPropsCancelIcon = {
  size: number;
};

export function CancelIcon(props: TPropsCancelIcon) {
  return <MdOutlineCancel size={`${props.size}px`} />;
}
