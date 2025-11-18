import Badge from "../../components/Badge";

const skillCategories = [
  {
    title: "Programming & Machine Learning",
    skills: [
      { name: "Python", level: "Advanced" },
      { name: "SQL", level: "Advanced" },
      { name: "R", level: "Intermediate" },
      { name: "C++", level: "Intermediate" },
      { name: "PyTorch", level: "Advanced" },
      { name: "TensorFlow", level: "Advanced" },
      { name: "scikit-learn", level: "Advanced" },
    ]
  },
  {
    title: "Data Visualization & Analytics",
    skills: [
      { name: "Tableau", level: "Advanced" },
      { name: "Power BI", level: "Advanced" },
      { name: "matplotlib", level: "Advanced" },
      { name: "seaborn", level: "Advanced" },
      { name: "pandas", level: "Advanced" },
      { name: "NumPy", level: "Advanced" },
    ]
  },
  {
    title: "Cloud & Development Tools",
    skills: [
      { name: "AWS", level: "Intermediate" },
      { name: "Git", level: "Advanced" },
      { name: "Docker", level: "Intermediate" },
      { name: "Jupyter", level: "Advanced" },
      { name: "nbgrader", level: "Advanced" },
      { name: "Salesforce", level: "Intermediate" },
    ]
  },
  {
    title: "Specialized Areas",
    skills: [
      { name: "Machine Learning", level: "Advanced" },
      { name: "Data Analytics", level: "Advanced" },
      { name: "Deep Learning", level: "Advanced" },
      { name: "AI Security", level: "Intermediate" },
      { name: "Computer Vision", level: "Advanced" },
      { name: "Educational Technology", level: "Advanced" },
    ]
  }
];

const getLevelColor = (level: string) => {
  switch (level) {
    case "Advanced": return "teal";
    case "Intermediate": return "violet";
    case "Beginner": return "gray";
    default: return "gray";
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
                  <span className="text-slate-200">{skill.name}</span>
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
          Actively seeking <strong className="text-white">Data Scientist / ML Engineer / Data Analyst</strong> roles 
          to apply technical and analytical skills in delivering business impact. Available for full-time opportunities 
          starting December 2025. Experienced in machine learning, data analytics, and scalable educational technology 
          with a proven track record in both academic and industry settings.
        </p>
      </div>
    </div>
  );
}