export default function Section({ title, subtitle, children }:{
  title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <section className="container-max pb-14">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {subtitle && <p className="text-slate-300 mt-1">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
