import React, { useState, useCallback, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import * as Lib from "LIB";
const Table = Lib.Table;

const DEPTS = [
  { value: "sales", label: "営業部" },
  { value: "dev", label: "開発部" },
  { value: "admin", label: "総務部" },
  { value: "hr", label: "人事部" },
];

function makeRows(n) {
  return Array.from({ length: n }, (_, i) => ({
    id: String(i + 1),
    name: `社員 ${i + 1}`,
    kana: `しゃいん ${(i * 7919) % n}`,
    dept: DEPTS[i % 4].value,
    age: 20 + ((i * 37) % 45),
    score: (i * 7919) % 1000,
    email: `user${i + 1}@example.com`,
    note: i % 3 ? `メモ ${i}` : "",
  }));
}

let setRowsGlobal;
function App({ initial, perPage }) {
  const [rows, setRows] = useState(initial);
  setRowsGlobal = setRows;
  const save = useCallback((key, value, current, done) => {
    setRows((rs) => rs.map((r) => (r.id === current.id ? { ...r, [key]: value } : r)));
    done();
  }, []);
  const stable = new URLSearchParams(location.search).get("stable") === "1";
  const makeCols = () => [
    { key: "name", type: "string", label: "氏名", editable: true, onCellBlur: save },
    { key: "kana", type: "string", label: "かな" },
    { key: "dept", type: "select", label: "部署", options: DEPTS, editable: true, onCellBlur: save },
    { key: "age", type: "number", label: "年齢", editable: true, onCellBlur: save },
    { key: "score", type: "number", label: "点数" },
    { key: "email", type: "string", label: "メール" },
    { key: "note", type: "string", label: "メモ", editable: true, onCellBlur: save },
  ];
  const memoCols = useMemo(makeCols, []);
  const cols = stable ? memoCols : makeCols();
  return (
    <Table
      id="B"
      cols={cols}
      rows={rows}
      maxHeight="600px"
      onUpdateRow={(n) => setRows((rs) => rs.map((r) => (r.id === n.id ? n : r)))}
      initialCondition={{ pagenation: { rowCountPerPage: perPage } }}
      checkbox={{ checked: () => false, onChecked: () => {}, onUnchecked: () => {} }}
    />
  );
}

const params = new URLSearchParams(location.search);
const n = Number(params.get("rows") ?? 10000);
const perPage = params.get("per") === "all" ? "all" : Number(params.get("per") ?? 50);
const rows = makeRows(n);
const t0 = performance.now();
const root = createRoot(document.getElementById("root"));
flushSync(() => root.render(<App initial={rows} perPage={perPage} />));
requestAnimationFrame(() => requestAnimationFrame(() => {
  window.__mount = performance.now() - t0;
}));
window.__updateOne = (i) => {
  setRowsGlobal((rs) => rs.map((r, j) => (j === i ? { ...r, score: r.score + 1 } : r)));
};
window.__replaceAll = () => {
  setRowsGlobal((rs) => rs.map((r) => ({ ...r })));
};
