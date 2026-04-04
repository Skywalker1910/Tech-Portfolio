import Badge from "../../components/Badge";
import {
  SiPython, SiPostgresql, SiCplusplus,
  SiPytorch, SiTensorflow, SiScikitlearn,
  SiPlotly,
  SiPandas, SiNumpy,
  SiGit, SiGithub, SiDocker, SiJupyter, SiSalesforce, SiPostman,
  SiOpencv, SiR,
} from "react-icons/si";
import { Cloud, BrainCircuit, BarChart3, ShieldAlert, Eye, Workflow, GraduationCap, TrendingUp, FlaskConical, BarChart2, Table2 } from "lucide-react";

type Skill = { name: string; level: string; icon?: React.ReactNode };

const skillCategories: { title: string; skills: Skill[] }[] = [
  {
    title: "Programming & Machine Learning",
    skills: [
      { name: "Python",       level: "Advanced",     icon: <SiPython className="text-[#3776AB]" /> },
      { name: "SQL",          level: "Advanced",     icon: <SiPostgresql className="text-[#336791]" /> },
      { name: "R",            level: "Intermediate", icon: <SiR className="text-[#276DC3]" /> },
      { name: "C++",          level: "Intermediate", icon: <SiCplusplus className="text-[#00599C]" /> },
      { name: "PyTorch",      level: "Advanced",     icon: <SiPytorch className="text-[#EE4C2C]" /> },
      { name: "TensorFlow",   level: "Advanced",     icon: <SiTensorflow className="text-[#FF6F00]" /> },
      { name: "scikit-learn", level: "Advanced",     icon: <SiScikitlearn className="text-[#F7931E]" /> },
    ]
  },
  {
    title: "Data Visualization & Analytics",
    skills: [
      { name: "Tableau",    level: "Advanced", icon: <Table2 size={18} className="text-[#E97627]" /> },
      { name: "Power BI",   level: "Advanced", icon: <BarChart2 size={18} className="text-[#F2C811]" /> },
      { name: "matplotlib", level: "Advanced", icon: <SiPlotly className="text-[#3F4F75]" /> },
      { name: "seaborn",    level: "Advanced", icon: <FlaskConical size={18} className="text-teal-400" /> },
      { name: "pandas",     level: "Advanced", icon: <SiPandas className="text-[#8b5cf6]" /> },
      { name: "NumPy",      level: "Advanced", icon: <SiNumpy className="text-[#4DABCF]" /> },
    ]
  },
  {
    title: "Cloud & Development Tools",
    skills: [
      { name: "AWS",        level: "Intermediate", icon: <Cloud size={18} className="text-[#FF9900]" /> },
      { name: "Git",        level: "Advanced",     icon: <SiGit className="text-[#F05032]" /> },
      { name: "GitHub",     level: "Advanced",     icon: <SiGithub className="text-zinc-300" /> },
      { name: "Docker",     level: "Intermediate", icon: <SiDocker className="text-[#2496ED]" /> },
      { name: "Jupyter",    level: "Advanced",     icon: <SiJupyter className="text-[#F37626]" /> },
      { name: "OpenCV",     level: "Advanced",     icon: <SiOpencv className="text-[#5C3EE8]" /> },
      { name: "Salesforce", level: "Intermediate", icon: <SiSalesforce className="text-[#00A1E0]" /> },
      { name: "Postman",    level: "Intermediate", icon: <SiPostman className="text-[#FF6C37]" /> },
    ]
  },
  {
    title: "Specialized Areas",
    skills: [
      { name: "Machine Learning",       level: "Advanced",     icon: <BrainCircuit size={18} className="text-violet-400" /> },
      { name: "Data Analytics",         level: "Advanced",     icon: <BarChart3 size={18} className="text-teal-400" /> },
      { name: "Deep Learning",          level: "Advanced",     icon: <BrainCircuit size={18} className="text-orange-400" /> },
      { name: "Statistical Modeling",   level: "Advanced",     icon: <TrendingUp size={18} className="text-sky-400" /> },
      { name: "AI Security",            level: "Intermediate", icon: <ShieldAlert size={18} className="text-red-400" /> },
      { name: "Computer Vision",        level: "Advanced",     icon: <Eye size={18} className="text-emerald-400" /> },
      { name: "MLOps",                  level: "Intermediate", icon: <Workflow size={18} className="text-amber-400" /> },
      { name: "Educational Technology", level: "Advanced",     icon: <GraduationCap size={18} className="text-pink-400" /> },
    ]
  }
];

const getLevelColor = (level: string) => {
  switch (level) {
    case "Advanced":     return "teal";
    case "Intermediate": return "violet";
    case "Beginner":     return "gray";
    default:             return "gray";
  }
};

export default function Skills() {
  return (
    <div className="container-max py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Skills & Expertise</h1>
        <p className="mt-2 text-slate-300 text-lg">
          Technical skills developed through academic coursework, professional experience, and hands-on projects.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {skillCategories.map((category, i) => (
          <div key={i} className="card p-6 bg-slate-900/60 border-slate-800">
            <h2 className="text-xl font-semibold mb-4">{category.title}</h2>
            <div className="space-y-3">
              {category.skills.map((skill, j) => (
                <div key={j} className="flex items-center justify-between">
                  <span className="flex items-center gap-2.5 text-slate-200">
                    {skill.icon && (
                      <span className="flex items-center justify-center w-5 h-5 text-[18px] shrink-0">
                        {skill.icon}
                      </span>
                    )}
                    {skill.name}
                  </span>
                  <Badge color={getLevelColor(skill.level)}>
                    {skill.level}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 card p-8 bg-slate-900/60 border-slate-800">
        <h2 className="text-2xl font-semibold mb-4">Professional Experience Highlights</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-violet-400">Coursera</div>
            <div className="text-sm text-slate-300">Online Platform Development</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-teal-400">nbgrader</div>
            <div className="text-sm text-slate-300">Automated Grading Framework</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-400">Cross-Platform</div>
            <div className="text-sm text-slate-300">Educational Technology</div>
          </div>
        </div>
      </div>

      <div className="mt-8 card p-6 bg-slate-900/60 border-slate-800">
        <h2 className="text-xl font-semibold mb-4">Career Objective</h2>
        <p className="text-slate-300 leading-relaxed">
          Actively seeking <strong className="text-white">AI Engineer / ML Engineer / Data Scientist</strong> roles 
          to apply technical and analytical skills in delivering business impact. Experienced in machine learning, 
          data analytics, and scalable educational technology with a proven track record in both academic and 
          industry settings.
        </p>
      </div>
    </div>
  );
}