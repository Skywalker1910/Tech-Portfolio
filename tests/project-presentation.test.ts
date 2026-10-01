import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import { DEFAULT_PROJECTS } from "../lib/content/defaults";
import { validateContent } from "../lib/content/validation";
import { projectCapture, withProjectPresentation } from "../lib/project-presentation";

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
