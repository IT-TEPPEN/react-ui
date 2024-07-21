"use client";

import { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { useCellIsFocusContext } from "../../sheet/providers";

export function useScrollAtFocusCell() {
  const isFocus = useCellIsFocusContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { inView, ref } = useInView({
    root: document.querySelector("#table-frame"),
    rootMargin: "-60px -30px -30px -30px",
    threshold: 1,
  });

  useEffect(() => {
    if (isFocus && !inView) {
      if (scrollRef.current) {
        scrollRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
      }
    }
  }, [isFocus, inView, scrollRef]);

  return { ref, scrollRef };
}
