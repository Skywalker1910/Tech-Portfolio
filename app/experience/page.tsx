import Timeline, { Item } from "../../components/Timeline";
export default function Experience() {
  return (
    <div className="container-max py-12">
      <h1 className="text-3xl font-bold mb-8">Professional Experience</h1>
      
      {/* Current Role - Graduate Student Hourly */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-violet-400 mb-4">Graduate Student Hourly – Clemson University</h2>
        <p className="text-slate-300 mb-4 text-sm">Academic & Educational Technology | Aug 2024 – Present</p>
        <div className="card p-6 bg-slate-900/60 border-slate-800">
          <Timeline items={[{
            title: "School of Computing",
            org: "Clemson University",
            period: "Aug 2024 – Present",
            bullets: [
              "Initial Phase: Designed lab and homework assignments for students enrolled in online degree on Coursera platform",
              "Built source assignment notebooks with comprehensive test cases using asserts for automated validation",
              "Implemented nbgrader tool to automate the grading process of Jupyter notebooks for Coursera labs",
              "Spring 2025 Semester: Maintained live coursework material, resolving bugs in grader logic and notebook functionality",
              "Conducted regular office hours to address student doubts and fix programming or logical bugs in notebooks",
              "Current Project: Building automated grading framework for CPSC 6300 (Applied Data Science) in-person graduate class",
              "Developing cross-platform grading solution to expand framework beyond online courses",
              "GitHub Repository: https://github.com/Skywalker1910/cpsc6300-autograder (work in progress)"
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
            <h3 className="font-semibold text-violet-400 mb-2">Graduate Student Hourly @ Clemson (2024 - Present)</h3>
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
