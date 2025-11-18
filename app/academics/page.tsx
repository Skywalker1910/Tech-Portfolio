export default function Academics() {
  return (
    <div className="container-max py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Academic Work & Research</h1>
        <p className="mt-2 text-slate-300 text-lg">
          Graduate-level research projects, coursework, and contributions to academic knowledge in computer science and data science.
        </p>
      </div>

      {/* Graduate Security Research */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-violet-400 mb-4">Graduate Security Research</h2>
        
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="card p-6 bg-slate-900/60 border-slate-800">
            <h3 className="text-xl font-semibold mb-3 text-violet-300">MASTERKEY Jailbreak Replication</h3>
            <p className="text-slate-300 mb-4 text-sm leading-relaxed">
              Advanced research on Large Language Model security vulnerabilities as part of graduate-level security coursework. 
              Reproduced and analyzed jailbreak attempts on GPT-3.5, GPT-4, and GPT-4.5.
            </p>
            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex items-start gap-2">
                <span className="text-violet-400 mt-1">•</span>
                <span>Built comprehensive evaluation metrics to measure model defense mechanisms</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-violet-400 mt-1">•</span>
                <span>Developed automated testing frameworks for various attack vectors</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-violet-400 mt-1">•</span>
                <span>Analyzed effectiveness of safety guardrails and security policies</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-violet-400 mt-1">•</span>
                <span>Documented vulnerabilities and proposed mitigation strategies</span>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs px-2 py-1 rounded-full border border-violet-700 text-violet-300">LLM Security</span>
              <span className="text-xs px-2 py-1 rounded-full border border-violet-700 text-violet-300">GPT Models</span>
              <span className="text-xs px-2 py-1 rounded-full border border-violet-700 text-violet-300">Evaluation</span>
            </div>
          </div>

          <div className="card p-6 bg-slate-900/60 border-slate-800">
            <h3 className="text-xl font-semibold mb-3 text-teal-300">AdvRM: Adversarial Patches</h3>
            <p className="text-slate-300 mb-4 text-sm leading-relaxed">
              Research project focusing on adversarial attacks against self-driving car perception systems, 
              specifically targeting depth estimation models critical for autonomous navigation.
            </p>
            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex items-start gap-2">
                <span className="text-teal-400 mt-1">•</span>
                <span>Implemented sophisticated adversarial patch attacks on computer vision models</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-teal-400 mt-1">•</span>
                <span>Studied impact on safety-critical autonomous vehicle systems</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-teal-400 mt-1">•</span>
                <span>Evaluated existing defense mechanisms and real-world effectiveness</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-teal-400 mt-1">•</span>
                <span>Contributed to understanding of AV perception pipeline vulnerabilities</span>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs px-2 py-1 rounded-full border border-teal-700 text-teal-300">Adversarial ML</span>
              <span className="text-xs px-2 py-1 rounded-full border border-teal-700 text-teal-300">Autonomous Vehicles</span>
              <span className="text-xs px-2 py-1 rounded-full border border-teal-700 text-teal-300">Computer Vision</span>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Technology & Applied Data Science */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-orange-400 mb-4">Educational Technology & Applied Data Science</h2>
        
        <div className="card p-6 bg-slate-900/60 border-slate-800 mb-6">
          <h3 className="text-xl font-semibold mb-3 text-orange-300">Graduate Student Hourly Research</h3>
          <p className="text-slate-300 mb-4 text-sm leading-relaxed">
            Extensive hands-on experience with practical machine learning applications and educational technology development 
            through my role as Graduate Student Hourly at Clemson University.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-orange-300 mb-2">Platform Development</h4>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1">•</span>
                  <span>Coursera platform: Designed lab and homework assignments for online degree program</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1">•</span>
                  <span>nbgrader implementation: Built source assignment notebooks with comprehensive test cases</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1">•</span>
                  <span>Automated grading: Implemented grading processes for Jupyter notebooks at scale</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-orange-300 mb-2">Maintenance & Support</h4>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1">•</span>
                  <span>Live course maintenance: Spring 2025 coursework, resolving grader logic bugs</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1">•</span>
                  <span>Cross-platform development: Building automated grading framework for CPSC 6300</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1">•</span>
                  <span>Educational support: Conducted office hours for programming and logical challenges</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6 bg-slate-900/60 border-slate-800">
          <h3 className="text-xl font-semibold mb-3 text-orange-300">Current Research: CPSC 6300 Autograder</h3>
          <p className="text-slate-300 mb-4 text-sm leading-relaxed">
            Developing a comprehensive cross-platform automated grading framework to expand beyond online courses. 
            This work-in-progress project aims to create scalable educational technology infrastructure for both online and in-person graduate courses.
          </p>
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-2 py-1 rounded-full border border-orange-700 text-orange-300">Cross-Platform</span>
              <span className="text-xs px-2 py-1 rounded-full border border-orange-700 text-orange-300">Python</span>
              <span className="text-xs px-2 py-1 rounded-full border border-orange-700 text-orange-300">Automation</span>
              <span className="text-xs px-2 py-1 rounded-full border border-orange-700 text-orange-300">Work in Progress</span>
            </div>
            <a 
              href="https://github.com/Skywalker1910/cpsc6300-autograder" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </div>

      {/* Computer Vision & Deep Learning */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-emerald-400 mb-4">Computer Vision & Deep Learning Projects</h2>
        
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 bg-slate-900/60 border-slate-800">
            <h3 className="text-xl font-semibold mb-3 text-emerald-300">Covid-19 Safeguard System</h3>
            <p className="text-slate-300 mb-4 text-sm leading-relaxed">
              Led a multidisciplinary team to develop real-time surveillance technology addressing public health challenges during the pandemic.
            </p>
            <div className="space-y-2 text-sm text-slate-300 mb-4">
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                <span>Team leadership and project management for 5-member development team</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                <span>Computer vision implementation using TensorFlow and OpenCV</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                <span>Real-time processing for face mask detection and social distancing monitoring</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                <span>System deployment and performance optimization for production environments</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 rounded-full border border-emerald-700 text-emerald-300">TensorFlow</span>
                <span className="text-xs px-2 py-1 rounded-full border border-emerald-700 text-emerald-300">OpenCV</span>
                <span className="text-xs px-2 py-1 rounded-full border border-emerald-700 text-emerald-300">Team Leadership</span>
              </div>
              <a 
                href="https://github.com/Skywalker1910/Covid-19-Safeguard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                View on GitHub
              </a>
            </div>
          </div>

          <div className="card p-6 bg-slate-900/60 border-slate-800">
            <h3 className="text-xl font-semibold mb-3 text-emerald-300">License Plate Detection (ANPR)</h3>
            <p className="text-slate-300 mb-4 text-sm leading-relaxed">
              Developed an Automatic Number Plate Recognition system combining computer vision and optical character recognition technologies.
            </p>
            <div className="space-y-2 text-sm text-slate-300 mb-4">
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                <span>Image preprocessing and enhancement techniques</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                <span>OpenCV for computer vision processing</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                <span>Pytesseract integration for optical character recognition</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                <span>Robust detection across various environmental conditions</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 rounded-full border border-emerald-700 text-emerald-300">OpenCV</span>
                <span className="text-xs px-2 py-1 rounded-full border border-emerald-700 text-emerald-300">OCR</span>
                <span className="text-xs px-2 py-1 rounded-full border border-emerald-700 text-emerald-300">Image Processing</span>
              </div>
              <a 
                href="https://github.com/Skywalker1910/License-Plate-Detection" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Research Interests */}
      <div className="card p-6 bg-slate-900/60 border-slate-800">
        <h2 className="text-xl font-semibold mb-4">Research Interests & Future Directions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <h3 className="font-semibold text-violet-400 mb-2">AI Security</h3>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Adversarial machine learning</li>
              <li>• Model robustness</li>
              <li>• LLM safety</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-teal-400 mb-2">Computer Vision</h3>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Object detection</li>
              <li>• Image processing</li>
              <li>• Real-time systems</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-orange-400 mb-2">Educational Technology</h3>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Scalable learning systems</li>
              <li>• Automated assessment</li>
              <li>• Cross-platform frameworks</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-emerald-400 mb-2">Data Science</h3>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Large-scale analytics</li>
              <li>• Machine learning engineering</li>
              <li>• Applied research methods</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
