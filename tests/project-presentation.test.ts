import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { RESUME_SKILL_CATEGORIES, RESUME_SKILLS_SOURCE } from "../lib/resume-skills";
import sharp from "sharp";
import { DEFAULT_PROJECTS } from "../lib/content/defaults";
import { validateContent } from "../lib/content/validation";
import { projectCapture, projectIllustration, withProjectPresentation, featuredWork } from "../lib/project-presentation";

test("Skills page uses the reviewed current resume, not the older alias",async()=>{
  assert.equal(RESUME_SKILLS_SOURCE,"/Aditya More - Resume.pdf");
  assert.equal(createHash("sha256").update(await readFile(`public${RESUME_SKILLS_SOURCE}`)).digest("hex"),"0577cedc6e43fab93b980a4dd07b80c3d66fb23b6c8f38e806ec1de8f0f86239","Resume changed: review the Skills section before updating this pinned hash.");
});
test("Skills inventory contains only the current resume Skills-section entries",()=>{
  assert.deepEqual(RESUME_SKILL_CATEGORIES.map(category=>[category.title,...category.skills]),[
    ["Programming","Python","SQL"],
    ["ML & Statistics","PyTorch","scikit-learn","Hugging Face Transformers"],
    ["Data & Visualization","pandas","NumPy","seaborn","matplotlib"],
    ["Tools & Infrastructure","AWS (EC2, S3, Lambda, Amplify, DynamoDB)","Docker","Git/GitHub","GitHub Actions (CI/CD)"],
    ["Core Areas","Machine Learning","Deep Learning","LLMs","GenAI","RAG","MLOps","Computer Vision"],
  ]);
});

test("every project has technical implementation with scoped metrics rather than invented outcomes",()=>{
  assert.equal(DEFAULT_PROJECTS.length,12);
  assert.ok(DEFAULT_PROJECTS.every(p=>p.technicalDetails?.length && p.limitations?.length));
  const movie=DEFAULT_PROJECTS.find(p=>p.id==="movie-recommendation")!;
  assert.ok(movie.evaluation!.some(metric=>metric.metric.includes("RMSE") && metric.context.includes("200 qualifying")));
  assert.ok(movie.evaluation!.some(metric=>metric.metric.includes("NDCG")));
  assert.ok(!DEFAULT_PROJECTS.find(p=>p.id==="neurallog")!.evaluation?.length);
});
test("older published records get technical supplements without overwriting admin text",()=>{
  const project=withProjectPresentation({id:"movie-recommendation",title:"Custom title",description:"Admin prose"});
  assert.equal(project.title,"Custom title");assert.equal(project.description,"Admin prose");assert.ok(project.technicalDetails?.length);
  assert.deepEqual(withProjectPresentation({id:"movie-recommendation",title:"Custom",technicalDetails:[]}).technicalDetails,[]);
  assert.equal(withProjectPresentation({id:"unknown",title:"Unknown"}).technicalDetails,undefined);
});
test("known stale titles and missing hosted URLs resolve without replacing custom admin choices",()=>{
  const bb8=withProjectPresentation({id:"bb8-rag",title:"AI-Powered Tech Portfolio (RAG-based System)"});
  assert.equal(bb8.title,"BB8 Co-Pilot x Tech Portfolio");assert.ok(projectCapture(bb8.demo));
  const movie=withProjectPresentation({title:"Personalized Movie Recommendation System"});
  assert.equal(movie.title,"Movie Recommendation Engine");assert.ok(projectCapture(movie.demo)?.motion);
  const custom=withProjectPresentation({id:"movie-recommendation",title:"My edited project",demo:"https://example.com/demo"});
  assert.equal(custom.title,"My edited project");assert.equal(custom.demo,"https://example.com/demo");
});
test("featured selection respects independent rank, publication and empty selection with no arbitrary cap",()=>{
  const items=DEFAULT_PROJECTS.map((p,i)=>({...p,featured:true,featuredOrder:20-i,published:true}));
  assert.equal(featuredWork(items).length,12);
  assert.equal(featuredWork(items)[0].id,items[11].id);
  assert.deepEqual(featuredWork(items.map(p=>({...p,featured:false}))),[]);
  assert.equal(featuredWork(items.map(p=>({...p,published:false}))).length,0);
  assert.equal(validateContent("projects",{...items[0],featuredOrder:-5})?.kind,"project");
  const saved=validateContent("projects",{...items[0],featuredOrder:8.4});
  assert.equal(saved?.kind === "project" ? saved.featuredOrder : undefined,8);
});
test("only captured exact HTTPS application roots receive media; no fake FIFA preview",()=>{
  assert.equal(projectCapture("https://game.adityamore.dev"),null);
  assert.equal(projectCapture("https://movies.adityamore.dev/private"),null);
  assert.equal(projectCapture("https://movies.adityamore.dev/?token=private"),null);
  assert.equal(projectCapture("http://movies.adityamore.dev"),null);
  assert.equal(projectCapture("/relative"),null);
  assert.ok(projectCapture("https://movies.adityamore.dev")?.motion);
});
test("published capture assets exist, are bounded and contain actual animated frames",async()=>{
  for(const p of DEFAULT_PROJECTS){const capture=projectCapture(p.demo);if(!capture)continue;
    assert.ok((await readFile(`public${capture.poster}`)).length<100000);
    if(capture.motion){const image=await sharp(`public${capture.motion}`,{animated:true}).metadata();assert.ok(image.pages!>1);assert.ok((await readFile(`public${capture.motion}`)).length<500000);}
  }
});
test("admin validation preserves technical fields, bounds data and rejects script sources",()=>{
  const content=validateContent("projects",{...DEFAULT_PROJECTS[2],evaluation:[{metric:"RMSE",value:"0.76",context:"Validation fixture",source:"javascript:alert(1)"}]});
  assert.ok(content && content.kind==="project");assert.ok(content.technicalDetails?.length);assert.equal(content.evaluation?.[0].source,undefined);
  assert.deepEqual(content.limitations,DEFAULT_PROJECTS[2].limitations);
  assert.equal(validateContent("projects",{title:"Synthetic",technicalDetails:[null,{}, {label:"",detail:"x"}]} as unknown)?.title,"Synthetic");
});

test("legacy project records regain model repositories while custom links stay intact",()=>{
  assert.equal(withProjectPresentation({id:"movie-recommendation",title:"Movie"}).huggingface,"https://huggingface.co/Skywalker1910/movie-rec-models");
  assert.equal(withProjectPresentation({id:"bb8-transformer",title:"BB8"}).huggingface,"https://huggingface.co/Skywalker1910/BB8");
  assert.equal(withProjectPresentation({id:"bb8-transformer",title:"BB8",huggingface:"https://huggingface.co/custom/model"}).huggingface,"https://huggingface.co/custom/model");
});
test("each project has a unique optimized illustration and unknown projects retain their fallback",async()=>{
  assert.equal(projectIllustration("Renamed agent","https://game.adityamore.dev","fifa-ai-agents"),"/project-illustrations/fifa-ai-agents.webp");
  const paths=new Set<string>();
  for(const project of DEFAULT_PROJECTS){
    const path=projectIllustration(project.title,project.demo);assert.ok(path);paths.add(path);
    const data=await readFile(`public${path}`);assert.ok(data.length<300000);
    const meta=await sharp(data).metadata();assert.equal(meta.width,1200);assert.equal(meta.height,800);
  }
  assert.equal(paths.size,12);assert.equal(projectIllustration("Unknown",undefined),null);
});
