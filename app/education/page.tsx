"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { Award, GraduationCap, Languages, MapPin, BookOpen, Shield, Database, FlaskConical } from "lucide-react";
import { SiPython, SiPytorch, SiTensorflow, SiOpencv, SiJupyter, SiScikitlearn } from "react-icons/si";

const degrees = [
  {
    degree: "M.S. Computer Science",
    degreeAwarded: "Master of Science in Computer Science",
    concentration: "Data Science and Informatics",
    gpa: "3.7 / 4.0",
    org: "Clemson University",
    location: "Clemson, SC, USA",
    period: "Jan 2024 – Dec 2025",
    logo: "/clemson-university-logo.png",
    logoSize: 130,
    gradient: "from-violet-950 via-purple-900/50 to-indigo-950",
    orb1: "bg-violet-500",
    orb2: "bg-indigo-400",
    border: "border-violet-500/20",
    glow: "hover:shadow-violet-500/20",
    accent: "text-violet-400",
    tag: "bg-violet-500/10 text-violet-300 border border-violet-500/20",
    gpaBg: "bg-violet-500/10 text-violet-300 border-violet-500/30",
    coursework: ["Machine Learning", "Deep Learning", "Design and Analysis of Algorithms", "Data Science", "Statistical Methods"],
    bullets: [
      "Specialized in **Machine Learning** and **Data Science** systems.",
      "Built and evaluated **ML** and **deep learning** models on real-world datasets.",
      "Conducted experiments on **LLM robustness**, modern AI systems and defense mechanisms.",
      "Designed and implemented **data pipelines** and model evaluation workflows.",
      "Explored modern AI systems including **LLMs**, **RAG pipelines**, and cloud-based ML workflows.",
      "Applied **statistical methods** for data analysis, model validation, and performance evaluation.",
    ],
    tags: [{ label: "Python", Icon: SiPython }, { label: "PyTorch", Icon: SiPytorch }, { label: "scikit-learn", Icon: SiScikitlearn }, { label: "Jupyter", Icon: SiJupyter }],
  },
  {
    degree: "B.E. Computer Science and Engineering",
    degreeAwarded: "Bachelor of Engineering in Computer Science",
    concentration: "Computer Science & Engineering",
    gpa: "3.22 / 4.0",
    org: "D.Y. Patil College of Engineering & Technology",
    location: "Kolhapur, India",
    period: "Aug 2017 – Jul 2021",
    logo: "/dypcet-logo.png",
    logoSize: 262,
    gradient: "from-blue-950 via-sky-900/50 to-cyan-950",
    orb1: "bg-blue-500",
    orb2: "bg-sky-400",
    border: "border-blue-500/20",
    glow: "hover:shadow-blue-500/20",
    accent: "text-blue-400",
    tag: "bg-blue-500/10 text-blue-300 border border-blue-500/20",
    gpaBg: "bg-blue-500/10 text-blue-300 border-blue-500/30",
    coursework: ["Data Structures", "Programming Language Labs (C, C++)", "Data Analytics", "Operating Systems", "Advanced Database Systems", "Internet of Things"],
    bullets: [
      "Built strong foundations in **programming (C, C++)**, **data structures**, and **algorithms**.",
      "Gained core knowledge in **operating systems**, **computer networks**, **database systems**, and **distributed systems**.",
      "Led a 5-member team for pre-final and final year projects to develop an **Automatic License Plate Recognition** system using **OpenCV** and a real-time **COVID-19 surveillance system** for face mask detection and social distancing monitoring.",
      "Developed hands-on experience in **computer vision**, **system design**, and full project lifecycle development.",
      "Applied **software engineering** principles including object-oriented design, testing, and system implementation.",
    ],
    tags: [{ label: "Python", Icon: SiPython }, { label: "TensorFlow", Icon: SiTensorflow }, { label: "OpenCV", Icon: SiOpencv }],
    logoFilter: "brightness(0) invert(1)",
  },
];

const certifications = [
  { name: "Cybersecurity Fundamentals", area: "Security", Icon: Shield },
  { name: "Certified Information Security and Ethical Hacker (CISEH)", area: "Security", Icon: Shield },
  { name: "Introduction to Cybersecurity", area: "Security", Icon: Shield },
  { name: "Data Science Orientation", area: "Data Science", Icon: Database },
  { name: "IBM Blockchain Essentials V2", area: "Blockchain", Icon: FlaskConical },
];

const languages = [
  { lang: "English", level: "Professional" },
  { lang: "Hindi", level: "Native / Bilingual" },
  { lang: "Marathi", level: "Native / Bilingual" },
];

export default function Education() {
  return (
    <div className="container-max py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-14"
      >
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap size={15} className="text-orange-400" />
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-zinc-500">Academic Background</p>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white">Education</h1>
        <p className="mt-3 text-zinc-500 max-w-lg text-sm leading-relaxed">
          Academic milestones from undergraduate engineering to graduate-level machine learning research.
        </p>
      </motion.div>

      {/* Degree cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-16">
        {degrees.map((d, i) => (
          <motion.div
            key={d.degree}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: i * 0.1 }}
            className={`group relative rounded-2xl border ${d.border} bg-zinc-900/70 overflow-hidden flex flex-col shadow-lg hover:shadow-xl ${d.glow} transition-all duration-300 hover:-translate-y-1`}
          >
            {/* Gradient header */}
            <div className={`relative h-40 overflow-hidden bg-gradient-to-br ${d.gradient}`}>
              {/* Orbs */}
              <motion.div
                className={`absolute top-4 left-8 w-28 h-28 rounded-full ${d.orb1} blur-3xl opacity-40`}
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.25, 0.4] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
              />
              <motion.div
                className={`absolute bottom-2 right-8 w-20 h-20 rounded-full ${d.orb2} blur-2xl opacity-30`}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.15, 0.3] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 + 1 }}
              />
              {/* Grid overlay */}
              <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
                  backgroundSize: "18px 18px",
                }}
              />
              {/* Logo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src={d.logo}
                  alt={d.org}
                  width={d.logoSize}
                  height={d.logoSize}
                  className="object-contain opacity-90 drop-shadow-lg"
                  style={d.logoFilter ? { filter: d.logoFilter } : undefined}
                />
              </div>
              {/* Period badge */}
              <span className="absolute top-3 right-3 text-[10px] font-mono bg-black/40 backdrop-blur-sm text-white/60 px-2 py-0.5 rounded-full border border-white/10">
                {d.period}
              </span>
            </div>

            {/* Body */}
            <div className="flex flex-col flex-1 p-5">
              {/* Degree + GPA row */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                <h2 className="text-lg font-bold text-white leading-snug">{d.degree}</h2>
                <span className={`self-start sm:self-auto text-[11px] font-semibold px-2.5 py-1 rounded-full border ${d.gpaBg} whitespace-nowrap`}>
                  GPA: {d.gpa}
                </span>
              </div>

              {/* University + Location */}
              <p className={`text-xs font-semibold ${d.accent} mb-0.5`}>{d.org}</p>
              <div className="flex items-center gap-1 text-[11px] text-zinc-500 mb-3">
                <MapPin size={10} />
                {d.location}
              </div>

              {/* Degree Awarded + Concentration */}
              <div className="mb-4 space-y-1">
                <p className="text-[11px] text-zinc-400">
                  <span className="text-zinc-500">Degree Awarded:</span>{" "}
                  <span className="text-zinc-300">{d.degreeAwarded}</span>
                </p>
                <p className="text-[11px] text-zinc-400">
                  <span className="text-zinc-500">Concentration:</span>{" "}
                  <span className="text-zinc-300">{d.concentration}</span>
                </p>
              </div>

              {/* Key Highlights */}
              <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-600 mb-2 flex items-center gap-1.5">
                Key Highlights
              </p>
              <ul className="space-y-1.5 mb-4">
                {d.bullets.map((b, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs text-zinc-400 leading-relaxed">
                    <span className={`mt-[5px] w-1 h-1 rounded-full shrink-0 ${d.orb1.replace("bg-", "bg-")}`} />
                    <span dangerouslySetInnerHTML={{ __html: b.replace(/\*\*(.*?)\*\*/g, '<strong class="text-zinc-200">$1</strong>') }} />
                  </li>
                ))}
              </ul>

              {/* Coursework */}
              <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-600 mb-2 flex items-center gap-1.5">
                <BookOpen size={9} /> Key Coursework
              </p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {d.coursework.map((c) => (
                  <span key={c} className={`text-[10px] px-2 py-0.5 rounded-full ${d.tag}`}>{c}</span>
                ))}
              </div>

              {/* Tech tags */}
              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-zinc-800/60">
                {d.tags.map(({ label, Icon }) => (
                  <span key={label} className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-300 border border-zinc-700/50`}>
                    <Icon size={9} /> {label}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Certifications */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-14"
      >
        <div className="flex items-center gap-2 mb-3">
          <Award size={15} className="text-orange-400" />
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-zinc-500">Credentials</p>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">Certifications</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certifications.map((cert, i) => (
            <motion.div
              key={cert.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="flex items-start gap-3 p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/50 hover:border-orange-500/30 hover:bg-zinc-900/80 transition-all duration-200 group"
            >
              <span className="mt-0.5 p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 shrink-0">
                <cert.Icon size={14} className="text-orange-400" />
              </span>
              <div>
                <p className="text-sm font-medium text-zinc-200 leading-snug group-hover:text-white transition-colors">{cert.name}</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">{cert.area}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Languages */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Languages size={15} className="text-sky-400" />
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-zinc-500">Communication</p>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Languages</h2>
        <div className="flex flex-wrap gap-3">
          {languages.map((l) => (
            <div key={l.lang} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-sky-500/30 transition-colors">
              <span className="font-semibold text-white text-sm">{l.lang}</span>
              <span className="text-xs text-zinc-500">· {l.level}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
