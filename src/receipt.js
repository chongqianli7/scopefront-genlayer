export function success(tx) {
  const status = tx.status,
    result = tx.result,
    ls = tx.consensus_data?.leader_receipt,
    l = Array.isArray(ls) ? ls.find((x) => x.mode === "leader") : ls;
  return (
    (status === "FINALIZED" || status === 7) &&
    (result === "MAJORITY_AGREE" || result === 6) &&
    l?.execution_result === "SUCCESS"
  );
}
export function terminal(tx) {
  return (
    ["FINALIZED", "CANCELED", "UNDETERMINED"].includes(tx.status) ||
    [6, 7, 8].includes(tx.status)
  );
}
export const escapeHTML = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export const short = (s) => (s ? s.slice(0, 7) + "…" + s.slice(-5) : "—");
export const json = (x) =>
  JSON.stringify(x, (_, v) => (typeof v === "bigint" ? v.toString() : v), 2);

export function confirmedFailure(tx) {
  const ls = tx.consensus_data?.leader_receipt,
    l = Array.isArray(ls) ? ls.find((x) => x.mode === "leader") : ls;
  return (
    terminal(tx) &&
    ([8, "CANCELED"].includes(tx.status) ||
      [7, "MAJORITY_DISAGREE"].includes(tx.result) ||
      l?.execution_result === "ERROR")
  );
}
export const addressOK=s=>/^0x[0-9a-f]{40}$/i.test(s||'')&&!/^0x0{40}$/i.test(s);
