import Timeline from "../../components/Timeline";
import { Award } from "lucide-react";

export default function Education() {
  return (
    <div className="container-max py-12">
      <h1 className="text-3xl font-bold mb-8">Education</h1>

      {/* Master's Degree */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-violet-400 mb-4">Graduate Education</h2>
        <div className="card p-6 bg-slate-900/60 border-slate-800">
          <Timeline items={[{
            title: "M.S. Computer Science",
            org: "Clemson University",
            period: "Jan 2024 – Dec 2025",
            bullets: [
              "Concentration: Data Science & Informatics",
              "Coursework: Deep Learning, Applied Data Science, Network Security, Advanced Algorithms",
              "Graduate Student Hourly – Data Science: Designed automated lab and homework assignments for Applied Data Science course",
              "Built Jupyter Notebook assignments covering ML pipeline (preprocessing, outlier detection, cross-validation, PCA)",
              "Implemented nbgrader automated grading for 200+ students",
              "Location: Clemson, SC"
            ]
          }]} />
        </div>
      </div>

      {/* Bachelor's Degree */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-teal-400 mb-4">Undergraduate Education</h2>
        <div className="card p-6 bg-slate-900/60 border-slate-800">
          <Timeline items={[{
            title: "B.E. Computer Science & Engineering",
            org: "D Y Patil College of Engineering & Technology",
            period: "2017 – 2021",
            bullets: [
              "Bachelor of Engineering in Computer Science & Engineering",
              "Location: Kolhapur, India",
              "Capstone projects in machine learning and computer vision",
              "Led a 5-member team for the Covid-19 Safeguard real-time surveillance system",
              "Built ANPR (License Plate Detection) system using OpenCV and Pytesseract"
            ]
          }]} />
        </div>
      </div>

      {/* Certifications */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-orange-400 mb-4">Certifications</h2>
        <div className="card p-6 bg-slate-900/60 border-slate-800">
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { name: "Cybersecurity Fundamentals", area: "Security" },
              { name: "Certified Information Security and Ethical Hacker (CISEH)", area: "Security" },
              { name: "Introduction to Cybersecurity", area: "Security" },
              { name: "Data Science Orientation", area: "Data Science" },
              { name: "IBM Blockchain Essentials V2", area: "Blockchain" },
            ].map((cert) => (
              <div key={cert.name} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50">
                <span className="mt-1"><Award size={16} className="text-orange-400" /></span>
                <div>
                  <p className="text-sm font-medium text-slate-200">{cert.name}</p>
                  <p className="text-xs text-slate-400">{cert.area}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Languages */}
      <div className="card p-6 bg-slate-900/60 border-slate-800">
        <h2 className="text-xl font-semibold mb-4">Languages</h2>
        <div className="flex flex-wrap gap-4">
          {[
            { lang: "English", level: "Professional" },
            { lang: "Hindi", level: "Native / Bilingual" },
            { lang: "Marathi", level: "Native / Bilingual" },
          ].map((l) => (
            <div key={l.lang} className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700">
              <span className="font-medium text-slate-200">{l.lang}</span>
              <span className="text-xs text-slate-400">— {l.level}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
