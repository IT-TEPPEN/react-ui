"use client";

import { useEffect, useRef, useState } from "react";
import { useColumnsWidthState, useScrollXPosition } from "../header";

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
      <style>{`
          .teppen-no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .teppen-no-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      <div
        ref={ref}
        id={props.id}
        className={`relative w-full h-full border border-gray-200 bg-white rounded-b-md overflow-auto ${
          props.displayScroll ? "" : "teppen-no-scrollbar"
        }`}
        style={{ maxHeight: props.maxHeight, maxWidth: props.maxWidth }}
      >
        {props.children}
      </div>

      {scrollInfo.barYHeight < 100 && (
        <>
          <div className="absolute top-0 right-0 h-full w-2 bg-slate-200 opacity-30 pointer-events-none" />

          <div
            className={`absolute right-0 w-2 bg-slate-500 rounded-full cursor-grab active:cursor-grabbing`}
            style={{
              top: `${scrollInfo.scrollY}%`,
              height: `${scrollInfo.barYHeight}%`,
            }}
            onMouseDown={(e) => {
              const startY = e.clientY;
              const startScrollY = ref.current?.scrollTop || 0;

              const onMouseMove = (moveEvent: MouseEvent) => {
                if (ref.current) {
                  const deltaY =
                    ((moveEvent.clientY - startY) / scrollInfo.barYHeight) *
                    100;
                  ref.current.scrollTop = startScrollY + deltaY;
                }
              };

              const onMouseUp = () => {
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
              };

              document.addEventListener("mousemove", onMouseMove);
              document.addEventListener("mouseup", onMouseUp);
            }}
          />
        </>
      )}

      {scrollInfo.barXWidth < 100 && (
        <>
          <div className="absolute bottom-0 left-0 w-full h-2 bg-slate-200 opacity-30 pointer-events-none" />

          <div
            className={`absolute bottom-0 h-2 bg-slate-500 rounded-full cursor-grab active:cursor-grabbing`}
            style={{
              left: `${scrollInfo.scrollX}%`,
              width: `${scrollInfo.barXWidth}%`,
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();

              const startX = e.clientX;
              const startScrollX = ref.current?.scrollLeft || 0;

              const onMouseMove = (moveEvent: MouseEvent) => {
                if (ref.current) {
                  e.preventDefault();
                  e.stopPropagation();

                  const deltaX =
                    ((moveEvent.clientX - startX) / scrollInfo.barXWidth) * 100;
                  ref.current.scrollLeft = startScrollX + deltaX;
                }
              };

              const onMouseUp = () => {
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
              };

              document.addEventListener("mousemove", onMouseMove);
              document.addEventListener("mouseup", onMouseUp);
            }}
          />
        </>
      )}
    </div>
  );
}
