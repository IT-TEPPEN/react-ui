import { forwardRef } from "react";
import { CancelIcon } from "../../cancel-icon";

export const CellInput = forwardRef(function CI(
  props: {
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    reset: () => void;
    endEditing: () => void;
  },
  ref: React.ForwardedRef<HTMLInputElement>
) {
  return (
    <div className={`flex justify-between gap-1 w-full items-center`}>
      <input
        ref={ref}
        className="w-full py-1 px-2 bg-white text-gray-900"
        type="text"
        value={props.value}
        onChange={props.onChange}
        onBlur={props.onBlur}
        onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) => {
          e.preventDefault();
          if (e.key === "Enter") {
            (e.target as HTMLInputElement).blur();
          } else if (e.key === "Escape") {
            props.reset();
            props.endEditing();
          }
        }}
      />
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          props.reset();
          props.endEditing();
        }}
      >
        <CancelIcon size={16} />
      </button>
    </div>
  );
});
