import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const num = (v) => (v === "" || v === null || v === undefined ? 0 : Number(v));
const fmt = (n) => (isNaN(n) ? "" : Number(n).toFixed(2));
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const load = (k, d) => {
  try {
    const v = JSON.parse(localStorage.getItem(k));
    return v ?? d;
  } catch {
    return d;
  }
};

export default function App() {
  const [account, setAccount] = useState(load("itp_account", {
    balance: 10000,
    riskPercent: 1.0,
    pair: "XAUUSD",
    tickValue: 1,
    pointSize: 0.1,
  }));

  const [idea, setIdea] = useState(load("itp_idea", {
    date: new Date().toISOString().slice(0, 10),
    pair: "XAUUSD",
    biasTF: "D1/H4 Uptrend",
    zones: "Demand: 2368–2372 | Supply: 2410–2415",
    entry: "",
    sl: "",
    tp: "",
    notes: "",
    news: { highImpactToday: false, within30m: false, avoidNews: true },
    atr: "",
  }));

  const [rows, setRows] = useState(load("itp_rows", []));
  const [filter, setFilter] = useState("");

  useEffect(() => save("itp_account", account), [account]);
  useEffect(() => save("itp_idea", idea), [idea]);
  useEffect(() => save("itp_rows", rows), [rows]);

  const rr = useMemo(() => {
    const risk = Math.abs(num(idea.entry) - num(idea.sl));
    const reward = Math.abs(num(idea.tp) - num(idea.entry));
    return risk > 0 ? reward / risk : 0;
  }, [idea.entry, idea.sl, idea.tp]);

  const positionSizing = useMemo(() => {
    const riskMoney = (num(account.balance) * num(account.riskPercent)) / 100;
    const stopDistance = Math.abs(num(idea.entry) - num(idea.sl));
    const points = stopDistance / (num(account.pointSize || 0.01));
    const valuePerLotPerPoint = num(account.tickValue) || 1;
    const lot = points > 0 ? riskMoney / (points * valuePerLotPerPoint) : 0;
    return { riskMoney, stopDistance, points, lot };
  }, [account, idea.entry, idea.sl]);

  const addIdea = () => {
    if (!idea.entry || !idea.sl || !idea.tp) {
      alert("Please fill Entry, SL, and TP");
      return;
    }
    const row = {
      id: crypto.randomUUID(),
      ...idea,
      rr,
      lot: positionSizing.lot,
      createdAt: new Date().toISOString(),
    };
    setRows([row, ...rows]);
  };

  const exportCSV = () => {
    const headers = [
      "Date","Pair","Bias","Zones","Entry","SL","TP","R:R","Lot","ATR","HighImpactToday","Within30m","AvoidNews","Notes",
    ];
    const csv = [headers.join(",")]
      .concat(rows.map((r) => [
            r.date,r.pair,quote(r.biasTF),quote(r.zones),r.entry,r.sl,r.tp,fmt(r.rr),fmt(r.lot),r.atr ?? "",r.news?.highImpactToday ? "Y" : "N",r.news?.within30m ? "Y" : "N",r.news?.avoidNews ? "Y" : "N",quote(r.notes ?? ""),
          ].join(",")))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `idea-trade-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => { if (confirm("Clear all saved ideas?")) setRows([]); };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-2xl md:text-4xl font-bold tracking-tight">Idea Trade Pro</motion.h1>
          <div className="flex flex-wrap gap-2 items-center">
            <button onClick={exportCSV} className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 shadow">Export CSV</button>
            <button onClick={clearAll} className="px-4 py-2 rounded-2xl bg-rose-700/80 hover:bg-rose-600 shadow">Clear Ideas</button>
          </div>
        </header>

        <section className="mt-6 grid md:grid-cols-2 gap-4">
          <Card title="Account & Risk">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Field label="Balance"><input type="number" className="input" value={account.balance} onChange={(e) => setAccount({ ...account, balance: e.target.value })} /></Field>
              <Field label="Risk % / trade"><input type="number" className="input" value={account.riskPercent} onChange={(e) => setAccount({ ...account, riskPercent: e.target.value })} /></Field>
              <Field label="Pair"><input type="text" className="input" value={account.pair} onChange={(e) => setAccount({ ...account, pair: e.target.value })} /></Field>
              <Field label="Point Size"><input type="number" className="input" step="0.001" value={account.pointSize} onChange={(e) => setAccount({ ...account, pointSize: e.target.value })} /></Field>
              <Field label="Value / point / lot"><input type="number" className="input" step="0.01" value={account.tickValue} onChange={(e) => setAccount({ ...account, tickValue: e.target.value })} /></Field>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Stat label="Risk $" value={`$${fmt(positionSizing.riskMoney)}`} />
              <Stat label="Stop Distance" value={`${fmt(positionSizing.stopDistance)} pts`} />
              <Stat label="Points @stop" value={fmt(positionSizing.points)} />
              <Stat label="Lot size" value={fmt(positionSizing.lot)} />
            </div>
          </Card>

          <Card title="News Guard">
            <div className="grid grid-cols-2 gap-3">
              <Toggle label="High-impact news today" checked={idea.news.highImpactToday} onChange={(v) => setIdea({ ...idea, news: { ...idea.news, highImpactToday: v } })} />
              <Toggle label="Within 30 minutes" checked={idea.news.within30m} onChange={(v) => setIdea({ ...idea, news: { ...idea.news, within30m: v } })} />
              <Toggle label="Avoid trading during news" checked={idea.news.avoidNews} onChange={(v) => setIdea({ ...idea, news: { ...idea.news, avoidNews: v } })} />
            </div>
            <p className="mt-3 text-xs text-slate-400">Pro tip: if <b>Within 30 minutes</b> and <b>Avoid trading during news</b> are both on, skip entries until volatility settles.</p>
          </Card>
        </section>

        <Card title="Idea Builder">
          <div className="grid md:grid-cols-6 gap-3">
            <Field label="Date"><input type="date" className="input" value={idea.date} onChange={(e) => setIdea({ ...idea, date: e.target.value })} /></Field>
            <Field label="Pair"><input type="text" className="input" value={idea.pair} onChange={(e) => setIdea({ ...idea, pair: e.target.value })} /></Field>
            <Field label="Bias (D1/H4)"><input type="text" className="input" placeholder="Uptrend / Downtrend / Range" value={idea.biasTF} onChange={(e) => setIdea({ ...idea, biasTF: e.target.value })} /></Field>
            <Field label="ATR (optional)"><input type="number" className="input" step="0.01" value={idea.atr} onChange={(e) => setIdea({ ...idea, atr: e.target.value })} /></Field>
            <Field className="md:col-span-2" label="Zones / S&D / Fib levels"><input type="text" className="input" value={idea.zones} onChange={(e) => setIdea({ ...idea, zones: e.target.value })} /></Field>
          </div>

          <div className="mt-4 grid md:grid-cols-6 gap-3">
            <Field label="Entry"><input type="number" className="input" value={idea.entry} onChange={(e) => setIdea({ ...idea, entry: e.target.value })} /></Field>
            <Field label="Stop Loss"><input type="number" className="input" value={idea.sl} onChange={(e) => setIdea({ ...idea, sl: e.target.value })} /></Field>
            <Field label="Take Profit"><input type="number" className="input" value={idea.tp} onChange={(e) => setIdea({ ...idea, tp: e.target.value })} /></Field>
            <Stat label="R : R" value={rr ? rr.toFixed(2) : "-"} />
            <Stat label="Lot (calc)" value={fmt(positionSizing.lot)} />
            <div className="flex items-end"><button onClick={addIdea} className="w-full h-10 rounded-2xl bg-emerald-600 hover:bg-emerald-500 shadow">Add Idea</button></div>
          </div>

          <Field className="mt-4" label="Notes">
            <textarea className="input min-h-[90px]" value={idea.notes} onChange={(e) => setIdea({ ...idea, notes: e.target.value })} placeholder="Entry trigger on M5: bullish engulfing at demand + EMA20>EMA50. Trail below swing lows." />
          </Field>
        </Card>

        <Card title="Journal">
          <div className="flex items-center justify-between gap-3 mb-3">
            <input placeholder="Filter by pair / note / date" className="input max-w-md" value={filter} onChange={(e) => setFilter(e.target.value)} />
            <span className="text-xs text-slate-400">{rows.length} ideas</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-slate-300">{["Date","Pair","Bias","Zones","Entry","SL","TP","R:R","Lot","ATR","News","Notes",""].map((h)=>(<th key={h} className="py-2 pr-3 font-medium">{h}</th>))}</tr></thead>
              <tbody>
                {rows.filter((r)=>(filter||"").toLowerCase().split(" ").filter(Boolean).every((t)=>JSON.stringify(r).toLowerCase().includes(t)))
                  .map((r)=>(
                  <tr key={r.id} className="border-t border-white/5 hover:bg-white/5">
                    <td className="py-2 pr-3 whitespace-nowrap">{r.date}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{r.pair}</td>
                    <td className="py-2 pr-3 max-w-[16ch] truncate" title={r.biasTF}>{r.biasTF}</td>
                    <td className="py-2 pr-3 max-w-[24ch] truncate" title={r.zones}>{r.zones}</td>
                    <td className="py-2 pr-3">{r.entry}</td>
                    <td className="py-2 pr-3">{r.sl}</td>
                    <td className="py-2 pr-3">{r.tp}</td>
                    <td className="py-2 pr-3">{fmt(r.rr)}</td>
                    <td className="py-2 pr-3">{fmt(r.lot)}</td>
                    <td className="py-2 pr-3">{r.atr}</td>
                    <td className="py-2 pr-3 text-xs">{r.news?.highImpactToday ? "High" : "-"}/{r.news?.within30m ? "30m" : "-"}</td>
                    <td className="py-2 pr-3 max-w-[28ch] truncate" title={r.notes}>{r.notes}</td>
                    <td className="py-2 pr-3"><button className="px-2 py-1 text-xs rounded-xl bg-slate-800 hover:bg-slate-700" onClick={()=>setRows(rows.filter((x)=>x.id!==r.id))}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <footer className="mt-8 text-center text-xs text-slate-500">Built for fast daily idea creation • Local-only (saves in your browser) • v1.0</footer>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (<motion.section initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/60 backdrop-blur rounded-2xl p-4 md:p-6 shadow-xl border border-white/10">{title && <h2 className="text-lg md:text-xl font-semibold mb-3">{title}</h2>}{children}</motion.section>);
}
function Field({ label, children, className = "" }) { return (<label className={"flex flex-col gap-1 "+className}>{label && <span className="text-xs text-slate-300">{label}</span>}{children}</label>); }
function Stat({ label, value }) { return (<div className="flex flex-col justify-end bg-slate-800/60 rounded-2xl p-3"><span className="text-[10px] uppercase tracking-wider text-slate-400">{label}</span><span className="text-base md:text-lg font-semibold">{value}</span></div>); }
function Toggle({ label, checked, onChange }) { return (<button type="button" onClick={()=>onChange(!checked)} className={`flex items-center justify-between w-full h-10 px-3 rounded-2xl border border-white/10 bg-slate-800/40 hover:bg-slate-800 ${checked ? "ring-1 ring-emerald-400/30" : ""}`}><span className="text-sm">{label}</span><span className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-emerald-500" : "bg-slate-600"}`}><span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-1"}`} /></span></button>); }
function quote(s) {
  if (s == null) return "";
  const str = String(s);
  const needsQuotes = /[",\n]/.test(str);
  const escaped = str.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

