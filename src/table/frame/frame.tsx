"use client";

import { useEffect, useRef } from "react";
import { useScrollXPosition } from "../header";

interface IPropsFrameDesign {
  maxHeight?: string;
  maxWidth?: string;
  displayScroll?: boolean;
}

interface IPropsFrame extends IPropsFrameDesign {
  id?: string;
  children: React.ReactNode;
}

export function Frame(props: IPropsFrame) {
  const { x, setScrollX } = useScrollXPosition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleBodyScroll = () => {
      if (ref.current) {
        setScrollX(ref.current.scrollLeft);
      }
    };

    if (ref.current) {
      ref.current.addEventListener("scroll", handleBodyScroll);
    }

    return () => {
      if (ref.current) {
        ref.current.removeEventListener("scroll", handleBodyScroll);
      }
    };
  }, [setScrollX]);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollLeft = x;
    }
  }, [x]);

  return (
    <div
      ref={ref}
      id={props.id}
      className={`relative w-full h-full border border-gray-200 bg-white rounded-b-md overflow-auto ${
        props.displayScroll ? "" : "no_scrollbar"
      }`}
      style={{ maxHeight: props.maxHeight, maxWidth: props.maxWidth }}
    >
      {props.children}
    </div>
  );
}
