import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { IIndex } from "../range/type";
import { useTableIdGenerator } from "../id";
import { useScrollXPosition } from "../header/x-scroll-position";
import { measureCell } from "../range/measure";
import { useMessages } from "../locale/provider";

type TCellNote = IIndex & { at: number };

type TFeedback = {
  saved: TCellNote | null;
  readOnly: TCellNote | null;
};

type TFeedbackActions = {
  /** The cell was saved: light it up for a moment. */
  markSaved: (cell: IIndex) => void;
  /** Someone tried to edit a cell of a read-only column. */
  showReadOnly: (cell: IIndex) => void;
};

const FeedbackContext = createContext<TFeedback>({
  saved: null,
  readOnly: null,
});
const FeedbackActionsContext = createContext<TFeedbackActions>({
  markSaved: () => {},
  showReadOnly: () => {},
});

const SAVED_MS = 1600;
const READ_ONLY_MS = 2000;

export function EditFeedbackProvider(props: { children: React.ReactNode }) {
  const [feedback, setFeedback] = useState<TFeedback>({
    saved: null,
    readOnly: null,
  });

  const actions = useMemo<TFeedbackActions>(
    () => ({
      markSaved: (cell) =>
        setFeedback((f) => ({ ...f, saved: { ...cell, at: Date.now() } })),
      showReadOnly: (cell) =>
        setFeedback((f) => ({ ...f, readOnly: { ...cell, at: Date.now() } })),
    }),
    []
  );

  // Each note goes away by itself.
  useEffect(() => {
    if (!feedback.saved) return;
    const at = feedback.saved.at;
    const timer = setTimeout(
      () =>
        setFeedback((f) => (f.saved?.at === at ? { ...f, saved: null } : f)),
      SAVED_MS
    );
    return () => clearTimeout(timer);
  }, [feedback.saved]);

  useEffect(() => {
    if (!feedback.readOnly) return;
    const at = feedback.readOnly.at;
    const timer = setTimeout(
      () =>
        setFeedback((f) =>
          f.readOnly?.at === at ? { ...f, readOnly: null } : f
        ),
      READ_ONLY_MS
    );
    return () => clearTimeout(timer);
  }, [feedback.readOnly]);

  return (
    <FeedbackActionsContext.Provider value={actions}>
      <FeedbackContext.Provider value={feedback}>
        {props.children}
      </FeedbackContext.Provider>
    </FeedbackActionsContext.Provider>
  );
}

export function useEditFeedback() {
  return useContext(FeedbackActionsContext);
}

/**
 * Drawn over the table, in the scroll area: a short glow on the cell that
 * was just saved, and a note on a read-only cell someone tried to edit.
 */
export function EditFeedback() {
  const IdGenerator = useTableIdGenerator();
  const { saved, readOnly } = useContext(FeedbackContext);
  const messages = useMessages();
  // Follow the cells while scrolling sideways (pinned columns stay put).
  useScrollXPosition();

  const savedBox = saved ? measureCell(IdGenerator, saved) : null;
  const readOnlyBox = readOnly ? measureCell(IdGenerator, readOnly) : null;

  return (
    <>
      <style>{`
        @keyframes teppen-table-saved {
          from { background-color: var(--teppen-table-saved, rgb(36 89 214 / 0.18)); }
          to { background-color: transparent; }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-teppen-part="saved"] { animation: none !important; opacity: 0.6; }
        }
      `}</style>
      {saved && savedBox && (
        <div
          key={saved.at}
          data-teppen-part="saved"
          className="absolute z-[1] pointer-events-none"
          style={{
            ...savedBox,
            animation: `teppen-table-saved ${SAVED_MS}ms ease-out forwards`,
          }}
        />
      )}
      {readOnly && readOnlyBox && (
        <div
          key={readOnly.at}
          role="status"
          data-teppen-part="read-only-note"
          className="absolute z-20 pointer-events-none whitespace-nowrap rounded-md px-2 py-1 text-xs shadow bg-[color:var(--teppen-table-hint-muted-bg,#4b5563)] text-[color:var(--teppen-table-hint-text,#ffffff)]"
          style={{
            top: readOnlyBox.top + readOnlyBox.height + 4,
            left: readOnlyBox.left,
          }}
        >
          {messages.readOnlyColumn}
        </div>
      )}
    </>
  );
}
