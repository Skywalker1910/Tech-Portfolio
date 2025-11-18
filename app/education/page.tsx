import Timeline, { Item } from "../../components/Timeline";

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
            period: "Expected Dec 2025",
            bullets: [
              "Concentration: Data Science & Informatics",
              "Coursework: Deep Learning, Applied Data Science, Network Security, Advanced Algorithms",
              "Graduate Student Hourly: Designed lab and homework assignments for online degree on Coursera platform",
              "Built source assignment notebooks with test cases using asserts and nbgrader for automated grading",
              "Maintained live coursework for Spring 2025 semester, resolving grader logic bugs and student issues",
              "Developed cross-platform automated grading framework for CPSC 6300 in-person graduate class",
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
            period: "Graduated Jul 2021",
            bullets: [
              "Bachelor of Engineering in Computer Science & Engineering",
              "Location: Kolhapur, India",
              "Foundation in computer science fundamentals and software engineering",
              "Coursework: Programming, Data Structures, Algorithms, Software Development",
              "Capstone projects in machine learning and computer vision",
              "Strong foundation in mathematics and engineering principles"
            ]
          }]} />
        </div>
      </div>

      {/* Academic Achievements */}
      <div className="card p-6 bg-slate-900/60 border-slate-800">
        <h2 className="text-xl font-semibold mb-4">Academic Highlights</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-violet-400 mb-2">Graduate Level</h3>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Advanced research in AI security and adversarial ML</li>
              <li>• Educational technology: Coursera platform and cross-platform grading frameworks</li>
              <li>• nbgrader automation and Jupyter notebook development</li>
              <li>• Live course maintenance and student support systems</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-teal-400 mb-2">Undergraduate Level</h3>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Strong foundation in computer science theory</li>
              <li>• Hands-on experience with software development</li>
              <li>• Project leadership and team collaboration</li>
              <li>• Introduction to machine learning and AI concepts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
