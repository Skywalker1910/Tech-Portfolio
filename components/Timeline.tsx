export type Item = { title:string; org?:string; period:string; bullets:string[] };
export default function Timeline({ items }:{items:Item[]}) {
  return (
    <ol className="relative border-slate-800">
      {items.map((it, i)=>(
        <li key={i} className="relative pl-6 pb-6">
          <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-violet-500" />
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold">{it.title}{it.org ? ` — ${it.org}` : ""}</h3>
            <span className="text-xs text-slate-400">{it.period}</span>
          </div>
          <ul className="mt-1 list-disc ml-5 text-sm text-slate-300">
            {it.bullets.map((b,j)=><li key={j}>{b}</li>)}
          </ul>
        </li>
      ))}
    </ol>
  );
}
