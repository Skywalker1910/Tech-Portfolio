import BackgroundFX from "../components/BackgroundFX";
import Link from "next/link";

export default function Home() {
  // sample cards; replace with real content later
  const projects = [
    { title: "LLM Jailbreak Defense Evaluation", blurb: "Benchmarks of prompts, defenses, and safety policy gaps.", tags: ["LLM", "Security", "RAG"], year: 2025 },
    { title: "Clustering Visual Explorer", blurb: "Interactive k-means/DBSCAN demos with parameter sliders.", tags: ["ML", "Visualization"], year: 2024 },
    { title: "Model Selection Toolkit", blurb: "Learning curves, grid search, bias–variance trade-off demos.", tags: ["ML"], year: 2024 },
  ];

  return (
    <div className="hero-wrap">
      <BackgroundFX />

      {/* HERO */}
      <div className="hero-inner">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Hi, I’m Aditya — Data <span className="text-violet-400">Science</span> &{" "}
              <span className="text-orange-400">Security</span>
            </h1>
            <p className="mt-4 text-lg text-slate-300">
              Master’s student at Clemson University focusing on Data Science & Informatics. I design ML systems, build
              interactive analytics, and explore security for AI and autonomous systems.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/projects" className="rounded-full px-5 py-2.5 bg-violet-600 text-white hover:bg-violet-500">
                Explore Projects
              </Link>
              <Link href="/academics" className="rounded-full px-5 py-2.5 border border-slate-700 hover:bg-slate-800">
                See Academic Work
              </Link>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              Coming soon: AI assistant to analyze job descriptions and answer questions about my work.
            </p>
          </div>

          <div className="card p-5 bg-slate-900/60 border-slate-800 text-slate-200">
            <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">Quick stats</div>
            <ul className="space-y-2 text-sm">
              <li>Clemson — MS CS (Data Science & Informatics)</li>
              <li>🧪 Projects in ML, RAG, and LLM evaluation</li>
              <li>🔐 CV/AV security case studies (adversarial robustness)</li>
              <li>🛠 TA: nbgrader automation, debugging, student support</li>
            </ul>
          </div>
        </div>
      </div>

      {/* HIGHLIGHTS */}
      <section className="container-max pb-12">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card p-5 bg-slate-900/50 border-slate-800">
            <h3 className="font-semibold">Model Selection & CV</h3>
            <p className="text-sm text-slate-300 mt-1">Learning curves, grid search, PCA visualizations.</p>
          </div>
          <div className="card p-5 bg-slate-900/50 border-slate-800">
            <h3 className="font-semibold">LLM Defense Evaluation</h3>
            <p className="text-sm text-slate-300 mt-1">Jailbreak prompts, safety policy gaps, benchmarking.</p>
          </div>
          <div className="card p-5 bg-slate-900/50 border-slate-800">
            <h3 className="font-semibold">Interactive Demos</h3>
            <p className="text-sm text-slate-300 mt-1">Live, parameterized visualizations for concepts.</p>
          </div>
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      <section className="container-max pb-16">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold">Featured Projects</h2>
          <Link href="/projects" className="text-sm text-slate-300 hover:underline">View all →</Link>
        </div>
        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p, i) => (
            <article key={i} className="card p-5 bg-slate-900/60 border-slate-800">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold">{p.title}</h3>
                <span className="text-xs text-slate-400">{p.year}</span>
              </div>
              <p className="mt-2 text-sm text-slate-300">{p.blurb}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {p.tags.map(t => (
                  <span key={t} className="text-xs px-2 py-1 rounded-full border border-slate-700 text-slate-300">
                    {t}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* EDUCATION + EXPERIENCE */}
      <section className="container-max pb-16">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-6 bg-slate-900/60 border-slate-800">
            <h3 className="font-semibold">Education</h3>
            <p className="text-sm text-slate-300 mt-2">
              Clemson University — MS CS (Data Science & Informatics). Coursework in Deep Learning, Applied DS, Network Security.
            </p>
          </div>
          <div className="card p-6 bg-slate-900/60 border-slate-800">
            <h3 className="font-semibold">Experience</h3>
            <p className="text-sm text-slate-300 mt-2">
              TA / Graduate Hourly — Designed DS labs, automated grading with nbgrader, managed tickets, and supported 100+ learners.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="container-max pb-20">
        <div className="card p-6 bg-slate-900/60 border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold">Want a quick tour?</h3>
            <p className="text-sm text-slate-300">Use the chat in the corner or reach out for a walkthrough.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/contact" className="rounded-full px-5 py-2.5 border border-slate-700 hover:bg-slate-800">Contact</Link>
            <Link href="/jd-match" className="rounded-full px-5 py-2.5 bg-violet-600 text-white hover:bg-violet-500">Try JD Match</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
