"use client";

import { InputArea, SelectBoxFrame } from "./parts";
import { Options, useOptionsWindowActions } from "./options-window";
import { SelectBoxProvider } from "./provider";
import { IdProvider } from "./id/provider";
import { useCallback, useEffect } from "react";
import { IdGenerator } from "./lib";

interface IPropsSelectBox {
  id: string;
  inputRef?: React.RefObject<HTMLInputElement>;
  defaultIsOpen?: boolean;
  options: Options[];
  value?: string;
  onSelect: (value: string) => void;
  no_appearance?: boolean;
  no_icon?: boolean;
  placeholder?: string;
}

export function SelectBox(props: IPropsSelectBox) {
  return (
    <SelectBoxProvider>
      <SelectBoxContent {...props} />
    </SelectBoxProvider>
  );
}

function SelectBoxContent(props: IPropsSelectBox) {
  const { openOptionsWindow, closeOptionsWindow } = useOptionsWindowActions();

  const open = useCallback(() => {
    openOptionsWindow(
      IdGenerator.generateIdSelectBoxInputArea(props.id),
      props.options,
      props.onSelect
    );
  }, [props.id, props.options, props.onSelect]);

  const close = useCallback(() => {
    closeOptionsWindow();
  }, []);

  useEffect(() => {
    if (props.defaultIsOpen) {
      open();
    }
  }, [props.defaultIsOpen]);

  return (
    <IdProvider id={props.id}>
      <SelectBoxFrame open={open} close={close} no_icon={props.no_icon}>
        <InputArea
          id={props.id}
          value={props.value}
          open={open}
          close={close}
          inputRef={props.inputRef}
          options={props.options}
          no_appearance={props.no_appearance}
          placeholder={props.placeholder}
        />
      </SelectBoxFrame>
    </IdProvider>
  );
}
