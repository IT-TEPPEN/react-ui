import { LiaEdit } from "react-icons/lia";

type TPropsEditIcon = {
  size: number;
};

export function EditIcon(props: TPropsEditIcon) {
  return <LiaEdit size={`${props.size}px`} />;
}
