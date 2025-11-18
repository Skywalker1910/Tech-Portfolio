import BackgroundFX from "../components/BackgroundFX";
import Link from "next/link";

export default function Home() {
  // Real projects based on resume
  const projects = [
    { title: "MASTERKEY Jailbreak Replication", blurb: "Reproduced jailbreak attempts on GPT models with evaluation metrics for model defenses.", tags: ["LLM", "Security", "Evaluation"], year: 2025 },
    { title: "AdvRM Adversarial Patches", blurb: "Implemented adversarial patches to mislead self-driving car depth estimation systems.", tags: ["Computer Vision", "Security", "Deep Learning"], year: 2024 },
    { title: "Covid-19 Safeguard System", blurb: "Real-time surveillance system detecting face masks & social distancing violations.", tags: ["Computer Vision", "TensorFlow", "OpenCV"], year: 2021 },
  ];

  return (
    <div className="hero-wrap">
      <BackgroundFX />

      {/* HERO */}
      <div className="hero-inner">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Hi, I'm Aditya — <span className="text-violet-400">Data Scientist</span> &{" "}
              <span className="text-orange-400">ML Engineer</span>
            </h1>
            <p className="mt-4 text-lg text-slate-300">
              Graduate student in Computer Science (Data Science & Informatics) at Clemson University. 
              Experienced in machine learning, data analytics, and scalable educational technology. 
              <strong className="text-white">Actively seeking data-focused roles</strong> in the tech industry.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/projects" className="rounded-full px-5 py-2.5 bg-violet-600 text-white hover:bg-violet-500">
                View My Projects
              </Link>
              <Link href="/experience" className="rounded-full px-5 py-2.5 border border-slate-700 hover:bg-slate-800">
                See Experience
              </Link>
              <a href="mailto:aditya.more@outlook.in" className="rounded-full px-5 py-2.5 bg-orange-600 text-white hover:bg-orange-500">
                Contact Me
              </a>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              🇺🇸 <strong>Work Authorization:</strong> Available to work in the United States starting January 2026
            </p>
          </div>

          <div className="card p-5 bg-slate-900/60 border-slate-800 text-slate-200">
            <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">Career Status</div>
            <ul className="space-y-2 text-sm">
              <li>Clemson — MS CS (Data Science & Informatics, Expected Dec 2025)</li>
              <li>Currently: Graduate Student Hourly - Educational Technology</li>
              <li>� <strong className="text-white">Actively Job Searching:</strong> Data Scientist, ML Engineer, Data Engineer, AI Engineer</li>
              <li>🇺🇸 <strong className="text-white">Work Authorization:</strong> Available January 2026</li>
              <li>Location: Clemson, SC (Open to relocation)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* HIGHLIGHTS */}
      <section className="container-max pb-12">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card p-5 bg-slate-900/50 border-slate-800">
            <h3 className="font-semibold">Data Science & Analytics</h3>
            <p className="text-sm text-slate-300 mt-1">Python, SQL, PyTorch, TensorFlow, scikit-learn, Tableau, Power BI.</p>
          </div>
          <div className="card p-5 bg-slate-900/50 border-slate-800">
            <h3 className="font-semibold">Machine Learning Engineering</h3>
            <p className="text-sm text-slate-300 mt-1">Model deployment, automated pipelines, cloud platforms, MLOps.</p>
          </div>
          <div className="card p-5 bg-slate-900/50 border-slate-800">
            <h3 className="font-semibold">AI & Research</h3>
            <p className="text-sm text-slate-300 mt-1">LLM security, computer vision, adversarial ML, educational AI.</p>
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
            {/* EDUCATION + EXPERIENCE */}
      <section className="container-max pb-16">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-6 bg-slate-900/60 border-slate-800">
            <h3 className="text-lg font-semibold mb-3">Seeking Opportunities</h3>
            <p className="text-sm text-slate-300 mb-4">
              Actively pursuing data-focused roles in the tech industry where I can apply my machine learning expertise 
              and educational technology experience to drive business impact.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-violet-400 rounded-full"></span>
                <span className="text-sm text-slate-300">Data Scientist</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                <span className="text-sm text-slate-300">Machine Learning Engineer</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
                <span className="text-sm text-slate-300">Data Engineer</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                <span className="text-sm text-slate-300">AI Engineer</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-xs text-slate-400">
                <strong>Available:</strong> January 2026 • <strong>Location:</strong> Open to relocation
              </p>
            </div>
          </div>
          
          <div className="card p-6 bg-slate-900/60 border-slate-800">
            <h3 className="text-lg font-semibold mb-3">What I Bring</h3>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <span className="text-violet-400 mt-1">•</span>
                <div>
                  <strong>Technical Expertise:</strong> Python, ML/AI frameworks, cloud platforms, data visualization tools
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-orange-400 mt-1">•</span>
                <div>
                  <strong>Research Experience:</strong> LLM security, computer vision, adversarial ML research
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-teal-400 mt-1">•</span>
                <div>
                  <strong>Industry Experience:</strong> Software testing, automation, global team collaboration
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">•</span>
                <div>
                  <strong>Educational Impact:</strong> Scalable technology solutions, automation frameworks
                </div>
              </div>
            </div>
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
