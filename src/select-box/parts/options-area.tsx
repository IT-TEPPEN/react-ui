import { useState } from "react";
import { ID_SELECT_BOX_FRAME, ID_SELECT_BOX_OPTIONS_AREA } from "../constants";
import { Options } from "../types";

interface IPropsSelectArea {
  options: Options[];
  value: string;
  onSelect: (value: string) => void;
}

export function OptionsArea({ options, value, onSelect }: IPropsSelectArea) {
  return (
    <div
      id={ID_SELECT_BOX_OPTIONS_AREA}
      className="absolute top-full left-0 w-full border border-gray-300"
    >
      {options.map((option) => (
        <div
          className={`hover:bg-gray-100 px-2 py-1 ${
            value === option.value ? "bg-gray-50" : "bg-white"
          }`}
          key={option.value}
          onClick={() => onSelect(option.value)}
        >
          {option.label}
        </div>
      ))}
    </div>
  );
}
