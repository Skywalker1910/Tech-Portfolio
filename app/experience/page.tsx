import Timeline, { Item } from "../../components/Timeline";
export default function Experience() {
  return (
    <div className="container-max py-12">
      <h1 className="text-3xl font-bold mb-8">Professional Experience</h1>
      
      {/* Current Role - Graduate Student Hourly */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-violet-400 mb-4">Graduate Student Hourly – Clemson University</h2>
        <p className="text-slate-300 mb-4 text-sm">Data Science | Aug 2024 – Dec 2025</p>
        <div className="card p-6 bg-slate-900/60 border-slate-800">
          <Timeline items={[{
            title: "Graduate Student Hourly – Data Science",
            org: "Clemson University, School of Computing",
            period: "Aug 2024 – Dec 2025",
            bullets: [
              "Designed and developed automated lab and homework assignments for a graduate-level Applied Data Science course",
              "Built Jupyter Notebook-based assignments using Python and nbgrader for automated grading",
              "Developed exercises covering data preprocessing, outlier detection (IQR, Z-score), model selection and cross-validation, feature selection, and PCA",
              "Implemented automated testing logic using Python to validate student submissions across 200+ students",
              "Created structured notebooks combining explanations, code scaffolding, and evaluation pipelines",
              "Handled technical and course-related tickets on Salesforce, ensuring smooth learner experience",
              "Conducted 2 weekly office hours to support students with technical and conceptual queries"
            ]
          }]} />
        </div>
      </div>

      {/* Previous Role - Software Test Engineer */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-teal-400 mb-4">Software Test Engineer – Amdocs</h2>
        <p className="text-slate-300 mb-4 text-sm">Software Engineering & Testing | Oct 2021 – Dec 2022</p>
        <div className="card p-6 bg-slate-900/60 border-slate-800">
          <Timeline items={[{
            title: "Software Test Engineer",
            org: "Amdocs",
            period: "Oct 2021 – Dec 2022",
            bullets: [
              "Conducted comprehensive end-to-end testing for AT&T telecom systems across web, video, and retail platforms",
              "Automated regression & functional test suites using Postman and Amdocs proprietary tools, improving efficiency",
              "Collaborated with a 25-member global team across US & India to deliver seamless system integration",
              "Ensured quality assurance for mission-critical telecommunications infrastructure serving millions of customers",
              "Worked in Pune, India office supporting major US telecom operations",
              "Gained experience in large-scale software testing methodologies and cross-cultural team collaboration"
            ]
          }]} />
        </div>
      </div>

      {/* Professional Growth & Skills */}
      <div className="card p-6 bg-slate-900/60 border-slate-800">
        <h2 className="text-xl font-semibold mb-4">Professional Development Journey</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-violet-400 mb-2">Graduate Student Hourly – Data Science @ Clemson (2024–2025)</h3>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Educational technology and platform development</li>
              <li>• Automated grading systems and nbgrader expertise</li>
              <li>• Cross-platform framework architecture</li>
              <li>• Student support and technical mentoring</li>
              <li>• Research in data science education methodologies</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-teal-400 mb-2">Software Test Engineer @ Amdocs (2021 - 2022)</h3>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Large-scale software testing and quality assurance</li>
              <li>• Test automation and efficiency optimization</li>
              <li>• Global team collaboration and communication</li>
              <li>• Mission-critical telecommunications systems</li>
              <li>• Industry best practices and methodologies</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
