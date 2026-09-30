import type { ExperienceContent, ProjectContent } from "./types";

export const DEFAULT_PROJECTS: ProjectContent[] = [
  {
    id:"bb8-rag", kind:"project", title:"BB8 Co-Pilot x Tech Portfolio",
    blurb:"A live, source-grounded portfolio assistant that retrieves verified evidence before answering visitors.",
    description:"Built the AI co-pilot for this portfolio with OpenAI Responses and Embeddings, Amazon S3 Vectors, and a persistent Next.js chat overlay. BB-8 retrieves only relevant, verified portfolio evidence, cites the matching pages, supports navigation and contact workflows, and falls back to deterministic local retrieval when vector search is unavailable.",
    highlights:["Designed section-aware chunking and retrieval over a verified knowledge corpus","Implemented OpenAI embeddings with Amazon S3 Vectors semantic search","Added grounded answers, source links, page navigation, resume delivery, and contact-form drafting","Built retrieval evaluation, usage telemetry, and privacy-aware first-party analytics","Deployed the SSR application through AWS Amplify with DynamoDB-backed content and administration"],
    tags:["LLM","RAG","OpenAI API","Embeddings","Amazon S3 Vectors","Next.js","TypeScript","React","AWS"],
    year:2026, status:"in-progress", featured:true, published:true, sortOrder:0,
    github:"https://github.com/Skywalker1910/Tech-Portfolio", demo:"https://www.adityamore.dev"
  },
  {
    id:"neurallog", kind:"project", title:"Neural Log — Personal Activity & Progress System",
    blurb:"A live multi-workspace tracker with an auditable XP ledger, analytics, AI weekly reviews, and long-term progress tools.",
    description:"Built a production activity system for training, nutrition, learning, habits, and daily routines. Flask serves a React and TypeScript application from one origin, SQLite is the authoritative store, and Docker Compose with Caddy runs the service on AWS Lightsail.",
    highlights:["Created eight evidence-based attributes backed by an auditable XP transaction ledger","Built training, nutrition, learning, habits, goals, streaks, records, and calendar analytics","Added private AI weekly reviews, illustrated personal libraries, and accessibility-focused mobile workflows","Implemented admin-managed invite codes, isolated administration, privacy-aware leaderboards, SQL migrations, and verified backups","Deployed Flask/Gunicorn, React, SQLite, Docker Compose, and Caddy on AWS Lightsail"],
    tags:["Python","Flask","React","TypeScript","SQLite","Docker","AWS","Data Analysis"],
    year:2026, status:"in-progress", featured:true, published:true, sortOrder:1,
    github:"https://github.com/Skywalker1910/Neural-Log", demo:"https://neurallog.adityamore.dev"
  },
  {
    id:"movie-recommendation", kind:"project", title:"Movie Recommendation Engine",
    blurb:"A live hybrid recommender spanning reproducible ML experiments, a Flask API, a React client, and AWS deployment.",
    description:"Expanded a Clemson course project into a production application combining FunkSVD, NeuMF, TF-IDF content similarity, and Bayesian popularity over MovieLens, TMDB, and IMDb data. The system includes personalized onboarding, watch history, live TMDB enrichment, Hugging Face model artifacts, an isolated admin dashboard, and automated CI/CD to AWS EC2.",
    highlights:["Processed 26M+ ratings across 270K users and 45K movies","Achieved RMSE 0.7600 with FunkSVD, about 21% better than the baseline","Improved NeuMF validation RMSE from 1.0725 to 0.8543 while reducing parameters from 26.3M to 13.1M","Combined collaborative, neural, content, and popularity signals for coverage-aware ranking","Moved versioned model artifacts to Hugging Face with automatic download when absent","Deployed Flask, React, Docker, nginx, gunicorn, SSL, and GitHub Actions on AWS EC2"],
    tags:["Python","scikit-learn","PyTorch","Flask","React","SQLite","Docker","AWS","Hugging Face","Recommender Systems"],
    year:2024, status:"completed", featured:true, published:true, sortOrder:2,
    github:"https://github.com/Skywalker1910/Movies-Recommendation-Engine", demo:"https://movies.adityamore.dev", huggingface:"https://huggingface.co/Skywalker1910/movie-rec-models"
  },
  {
    id:"bb8-transformer", kind:"project", title:"BB-8: Transformer Language Model",
    blurb:"An 11-experiment LLM engineering study from a 112K-parameter character model through Qwen LoRA and grounded retrieval.",
    description:"This separate LLM engineering study does not serve the live portfolio assistant. It builds a decoder-only GPT-style Transformer in PyTorch from first principles, then extends the work into Qwen2.5 LoRA fine-tuning and grounded retrieval with its own tokenizers, training and evaluation loops, decoding strategies, experiment tracking, and CPU Lambda deployment path.",
    highlights:["Implemented embeddings, causal multi-head attention, Pre-LN decoder blocks, and language-model heads from first principles","Ran 11 documented experiments from 112K parameters to Qwen2.5-0.5B LoRA fine-tuning","Built an 80-case, five-configuration chat suite that exposed a prompt-format mismatch and 29% training-example truncation","Used an 88-case grounded-QA benchmark and 80% promotion gate to reject a perplexity-1.03 model that passed only 22% of content and citation checks","Added dataset hashing, commit pinning, versioned configs, a model registry, Hugging Face artifacts, and AWS deployment"],
    tags:["Python","PyTorch","Transformers","NLP","LoRA","BPE","Hugging Face","AWS Lambda"],
    year:2026, status:"in-progress", featured:true, published:true, sortOrder:3,
    github:"https://github.com/Skywalker1910/BB-8", demo:"https://chat.adityamore.dev/", huggingface:"https://huggingface.co/Skywalker1910/BB8"
  },
  {
    id:"fifa-world-cup-2026", kind:"project", title:"FIFA World Cup 2026 Prediction Platform",
    blurb:"A live regional prediction platform with player accounts, public leaderboards, tournament views, and a private command center.",
    description:"Built a compact full-stack World Cup prediction system on a dependency-free Node HTTP server and SQLite. One deployment serves distinct US and India scoring experiences, authenticated players and AI agents, public profiles, fixture and bracket views, administrative operations, and optional score synchronization.",
    highlights:["Designed two regional scoring systems and role-scoped access from one SQLite-backed deployment","Implemented prediction locking, score forecasts, public picks, profiles, leaderboards, and tournament progression","Built a private command center for accounts, results, prediction records, settings, ledgers, and audit history","Added dedicated AI agent accounts with reasoning, confidence, provider, model, and accuracy metadata","Deployed the containerized service on Railway with persistent storage and production operations documentation"],
    tags:["JavaScript","Node.js","SQLite","Docker","Railway","AI Agents","API Integration"],
    year:2026, status:"in-progress", featured:true, published:true, sortOrder:4,
    github:"https://github.com/Skywalker1910/FIFA-World-Cup-2026", demo:"https://game.adityamore.dev"
  },
  {
    id:"fifa-ai-agents", kind:"project", title:"FIFA 2026 AI Prediction Agents",
    blurb:"Scheduled LLM agents authenticate as players, reason over eligible fixtures, and submit structured predictions to the live game.",
    description:"Built a companion Node service that reads live fixture context, validates eligibility, requests structured predictions from an OpenAI model, and submits picks with scores, rationale, confidence, and model metadata through the prediction platform's API. GitHub Actions can run the agent on a schedule, with dry-run controls and provider scaffolds for Claude and Gemini.",
    highlights:["Implemented API-based login, fixture retrieval, prediction submission, logout, and transient-lock retries","Enforced structured output, valid teams and match IDs, lock windows, and conservative score forecasts","Captured model, response ID, token usage, reasoning, confidence, and request metadata","Added dry-run, due-window, next-match, and update-existing execution modes","Automated scheduled runs with GitHub Actions and provider-specific adapters"],
    tags:["JavaScript","Node.js","OpenAI API","AI Agents","Structured Outputs","GitHub Actions"],
    year:2026, status:"in-progress", featured:false, published:true, sortOrder:5,
    github:"https://github.com/Skywalker1910/FIFA-World-Cup-2026-AI-Agents", demo:"https://game.adityamore.dev"
  },
  {
    id:"skynet-aqi", kind:"project", title:"Skynet — AQI Prediction System",
    blurb:"An ML pipeline that forecasts Air Quality Index from NASA TEMPO, OpenAQ, weather, and traffic data.",
    description:"Built an end-to-end machine-learning pipeline for the 2025 NASA Space Apps Challenge, integrating environmental, meteorological, and traffic sources to model temporal and spatial AQI patterns.",
    highlights:["Integrated NASA TEMPO, OpenAQ, weather, and traffic APIs","Designed ingestion, preprocessing, and feature-engineering pipelines","Modeled temporal and spatial patterns that influence air quality"],
    tags:["Python","scikit-learn","pandas","NumPy","ML Pipeline","Air Quality"],
    year:2025, status:"completed", featured:false, published:true, sortOrder:6
  },
  {
    id:"llm-defense", kind:"project", title:"LLM Jailbreak Defense Evaluation",
    blurb:"A black-box evaluation framework for jailbreak attempts, refusal behavior, latency, token use, and model failure modes.",
    description:"Replicated and extended the MASTERKEY approach for a Clemson security research project. The modular pipeline executes a multi-category jailbreak dataset against commercial LLMs, calculates query success rates, and categorizes timeouts, exceptions, and model refusals without internal model access.",
    highlights:["Built a 13-category dataset from public jailbreak sources and custom augmentations","Automated prompt execution, result logging, query-success evaluation, and category-level analysis","Tracked latency, token usage, response refusals, exceptions, and timeout failure modes","Evaluated multiple OpenAI model families through a reproducible black-box workflow"],
    tags:["Python","LLM","AI Security","Adversarial ML","Evaluation","OpenAI API"],
    year:2025, status:"completed", featured:false, published:true, sortOrder:7,
    github:"https://github.com/Skywalker1910/Evaluating-Defense-Mechanisms-Jailbreak-LLMs"
  },
  {
    id:"deep-learning-coursework", kind:"project", title:"Deep Learning Coursework — CPSC 8430",
    blurb:"A four-repository implementation series covering video captioning, spoken question answering, and generative adversarial networks.",
    description:"Completed a graduate deep-learning implementation series in PyTorch spanning attention-based Seq2Seq video captioning, BERT question answering over noisy speech transcripts, and DCGAN, WGAN, and ACGAN image-generation experiments.",
    highlights:["Built an encoder-decoder video-captioning model with attention and BLEU evaluation","Fine-tuned BERT-Base on Spoken-SQuAD with document stride, mixed precision, gradient checkpointing, and accumulation","Reached 63.5% F1 and 40.1% exact match on the Spoken-SQuAD assignment evaluation","Implemented DCGAN, WGAN, and ACGAN variants and compared generation quality with FID and Inception Score"],
    tags:["Python","PyTorch","Deep Learning","BERT","Transformers","GANs","Computer Vision","NLP"],
    year:2024, status:"completed", featured:false, published:true, sortOrder:8,
    github:"https://github.com/Skywalker1910/CPSC-8430-Deep-Learning"
  },
  { id:"alpr", kind:"project", title:"Automatic License Plate Recognition (ALPR)", blurb:"Computer vision system for vehicle license plate detection and text extraction.", description:"Developed a license plate detection and text extraction system using OpenCV and Tesseract OCR.", highlights:["Built plate detection using OpenCV contour analysis","Integrated Tesseract OCR","Implemented noise reduction and edge detection"], tags:["OpenCV","Tesseract","Python","OCR"], year:2021, status:"completed", featured:false, published:true, sortOrder:9, github:"https://github.com/Skywalker1910/License-Plate-Detection" },
  { id:"covid-safeguard", kind:"project", title:"COVID-19 Safeguard System", blurb:"Real-time monitoring system using computer vision for safety compliance.", description:"Built a TensorFlow and OpenCV system for face-mask and social-distancing compliance from live video.", highlights:["Built face-mask detection using TensorFlow","Implemented distancing violation detection","Processes live video with alerts"], tags:["Computer Vision","TensorFlow","OpenCV"], year:2021, status:"completed", featured:false, published:true, sortOrder:10, github:"https://github.com/Skywalker1910/Covid-19-Safeguard" },
  { id:"alien-invasion", kind:"project", title:"Alien Invasion", blurb:"2D arcade-style game built while learning Python fundamentals.", description:"A Pygame space shooter with player controls, enemy waves, score tracking, and game-state management.", highlights:["Classic space shooter mechanics","Player controls and enemy waves","Score and game-state management"], tags:["Python","Pygame"], year:2020, status:"completed", featured:false, published:true, sortOrder:11 },
];

export const DEFAULT_EXPERIENCE: ExperienceContent[] = [
  { id:"clemson-volunteer-researcher", kind:"experience", title:"Researcher - LLM Agents and Human Behavior", organization:"Clemson University", department:"LLM Agents & Human Behavior", subdepartment:"School of Computing", location:"Clemson, SC / Remote", period:"Apr 2026 – Present", type:"Research", summary:"Researching whether societies of Large Language Model agents can realistically simulate human behavior and support early-stage behavioral studies under Dr. Long Cheng.", researchAreas:"Large Language Models · LLM Agents · Multi-Agent Systems · Generative AI · Human Behavior Simulation · AI Evaluation", bulletHeading:"Research & Contributions", tagHeading:"Technologies & Research Tools", bullets:["Researching whether societies of LLM agents can substitute for human participants in behavioral pilot studies.","Reproducing published behavioral experiments and designing new studies with AgentSociety, YuLan-OneSim, Generative Agents, and related multi-agent frameworks.","Developing a taxonomy and metrics for behavioral realism, consistency, and human alignment across decision-making and social scenarios.","Designing Trust Game and Dictator Game experiments to compare LLM-agent decisions with established human data.","Exploring benchmarks for behavioral realism, consistency, and human-agent similarity."], tags:["Python","Large Language Models","Multi-Agent Systems","AgentSociety","YuLan-OneSim","Generative Agents","MiroFish","Literature Review","Experimental Design","Behavioral Evaluation"], logo:"/soc-logo.png", accent:"orange", showOnTimeline:true, published:true, sortOrder:0 },
  { id:"clemson-graduate-hourly", kind:"experience", title:"Graduate Teaching Assistant", organization:"Clemson University", department:"Applied Data Science", subdepartment:"School of Computing", location:"Clemson, SC, USA", period:"Aug 2024 – Dec 2025", type:"Teaching", bullets:["Designed Jupyter labs and assignments covering data preprocessing, supervised learning, unsupervised learning, model evaluation, and visualization","Built automated grading pipelines with Python and nbgrader to improve scoring consistency and reduce manual effort","Maintained live course infrastructure and resolved notebook and autograder issues","Explained machine-learning concepts and debugged student code during office hours","Collaborated with faculty on curriculum design and Coursera deployment"], tags:["Python","Jupyter","nbgrader","scikit-learn","Pandas","NumPy"], logo:"/soc-logo.png", accent:"violet", showOnTimeline:true, published:true, sortOrder:1 },
  { id:"amdocs-test-engineer", kind:"experience", title:"Software Test Engineer", organization:"Amdocs", department:"Software Quality Engineering", subdepartment:"Telecom Systems", location:"Pune, India", period:"Oct 2021 – Dec 2022", type:"Software Engineering & QA", bullets:["Performed end-to-end, regression, and integration testing for enterprise telecom systems supporting AT&T","Designed test cases and validation strategies for new features from product requirements and stakeholder input","Ran functional, UI, and API release tests with Selenium and Postman","Triaged defects and collaborated with cross-functional Agile teams in the United States and India","Participated in requirements analysis and production-release validation"], tags:["Postman","Selenium","API Testing","Agile"], logo:"/amdocs-logo.png", accent:"teal", showOnTimeline:true, published:true, sortOrder:2 },
];

export function defaultsFor(kind: "projects" | "experience") {
  return kind === "projects" ? DEFAULT_PROJECTS : DEFAULT_EXPERIENCE;
}
