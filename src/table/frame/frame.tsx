"use client";

import { useEffect, useRef, useState } from "react";
import {
  useColumnsWidth,
  useColumnsWidthState,
  useScrollXPosition,
} from "../header";

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
  // refのdiv内でのスクロール割合を保持
  const [scrollInfo, setScrollInfo] = useState({
    scrollX: 0,
    scrollY: 0,
    barYHeight: 0,
    barXWidth: 0,
  });
  const columnsWidhtState = useColumnsWidthState();

  useEffect(() => {
    const handleBodyScroll = () => {
      if (ref.current) {
        setScrollX(ref.current.scrollLeft);

        const scrollX =
          (ref.current.scrollLeft / ref.current.scrollWidth) * 100;
        const scrollY =
          (ref.current.scrollTop / ref.current.scrollHeight) * 100;
        const barYHeight =
          (ref.current.clientHeight / ref.current.scrollHeight) * 100;
        const barXWidth =
          (ref.current.clientWidth / ref.current.scrollWidth) * 100;

        setScrollInfo({
          scrollX: scrollX > 100 ? 100 : scrollX,
          scrollY: scrollY > 100 ? 100 : scrollY,
          barYHeight: barYHeight > 100 ? 100 : barYHeight,
          barXWidth: barXWidth > 100 ? 100 : barXWidth,
        });
      }
    };

    handleBodyScroll();

    if (ref.current) {
      ref.current.addEventListener("scroll", handleBodyScroll);
    }

    return () => {
      if (ref.current) {
        ref.current.removeEventListener("scroll", handleBodyScroll);
      }
    };
  }, [setScrollX, columnsWidhtState]);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollLeft = x;
    }
  }, [x]);

  return (
    <div
      className="relative"
      style={{ maxHeight: props.maxHeight, maxWidth: props.maxWidth }}
    >
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

      {scrollInfo.barYHeight < 100 && (
        <>
          <div className="absolute top-0 right-0 h-full w-2 bg-slate-200 opacity-30" />
          <div
            className="absolute right-0 w-2 bg-slate-500 rounded-full"
            style={{
              top: `${scrollInfo.scrollY}%`,
              height: `${scrollInfo.barYHeight}%`,
            }}
          />
        </>
      )}

      {scrollInfo.barXWidth < 100 && (
        <>
          <div className="absolute bottom-0 left-0 w-full h-2 bg-slate-200 opacity-30" />
          <div
            className={`absolute bottom-0 h-2 bg-slate-500 rounded-full`}
            style={{
              left: `${scrollInfo.scrollX}%`,
              width: `${scrollInfo.barXWidth}%`,
            }}
          />
        </>
      )}
    </div>
  );
}
