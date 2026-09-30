import { NextRequest, NextResponse } from "next/server";
import { isValidAdminRequest } from "@/lib/adminAuth";
import { ADMIN_EVALUATION_CASES, evaluationPlan, runAdminEvaluation } from "@/lib/rag/admin-evaluation";
import { claimEvaluation, finishEvaluation, getEvaluationStatus } from "@/lib/rag/evaluation-store";

export const dynamic="force-dynamic";
export const maxDuration=30;
const json=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"no-store"}});
export async function GET(req:NextRequest) {
  if (!isValidAdminRequest(req)) return json({error:"Unauthorized"},401);
  try {return json({status:await getEvaluationStatus()});} catch {return json({error:"Evaluation status unavailable."},503);}
}
export async function POST(req:NextRequest) {
  if (!isValidAdminRequest(req)) return json({error:"Unauthorized"},401);
  const origin=req.headers.get("origin");
  if (origin && origin!==new URL(req.url).origin) return json({error:"Cross-origin evaluation forbidden."},403);
  const body=await req.json().catch(()=>null);
  if (!body || !["retrieval","answers"].includes(body.preset)) return json({error:"Choose a supported preset."},400);
  const plan=evaluationPlan(body.preset);
  if (body.action==="dry-run") return json({plan}); // No AWS/OpenAI requests or writes.
  if (body.action!=="run" || body.approved!==true || body.budgetUsd!==.05 || body.priceRevision!==JSON.stringify(plan.prices)
    || typeof body.requestId!=="string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.requestId)
    || !ADMIN_EVALUATION_CASES.includes(body.caseId)) return json({error:"An approved $0.05 plan, matching pricing revision, UUID and synthetic fixture are required."},400);
  if (!plan.available) return json({error:"API configuration or verified pricing unavailable. Refresh official model rates if older than seven days."},503);
  try {await claimEvaluation(body.requestId);} catch {return json({error:"Run not started: another run, cooldown, duplicate ID or durable budget lock unavailable. No paid calls made."},409);}
  try {
    const report=await runAdminEvaluation(body.preset,body.caseId);
    await finishEvaluation(body.requestId,report);
    return json({report});
  } catch {
    // A crashed/uncertain run keeps its lease; never auto-retry paid requests.
    return json({error:"Run/report unavailable. Check status before starting another run; up to $0.05 may have been reserved."},503);
  }
}
