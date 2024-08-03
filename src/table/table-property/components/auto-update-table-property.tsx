import { useEffect } from "react";
import { useProcessedDataContext } from "../../sheet/providers";
import { useTablePropertyActionContext } from "../provider";

export function AutoUpdateTableProperty() {
  const { setMaxDisplayColCount, setMaxDisplayRowCount } =
    useTablePropertyActionContext();
  const { cols, rows } = useProcessedDataContext();

  useEffect(() => {
    setMaxDisplayColCount(cols.length);
  }, [cols.length]);

  useEffect(() => {
    setMaxDisplayRowCount(rows.length);
  }, [rows.length]);

  return <></>;
}
