import { NextRequest, NextResponse } from "next/server";
import { isValidAdminRequest } from "@/lib/adminAuth";
import { changePromptReview, listPromptReviews, validReviewDay, validReviewId } from "@/lib/chat-review";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store"};
export async function GET(req:NextRequest) {
  if(!isValidAdminRequest(req)) return NextResponse.json({error:"Unauthorized"},{status:401,headers});
  const day=req.nextUrl.searchParams.get("day") ?? new Date().toISOString().slice(0,10);
  const cursor=req.nextUrl.searchParams.get("cursor");
  if(!validReviewDay(day) || (cursor && !validReviewId(day,cursor))) return NextResponse.json({error:"Invalid date or cursor"},{status:400,headers});
  try{return NextResponse.json(await listPromptReviews(day,cursor),{headers});}
  catch{return NextResponse.json({error:"Prompt reviews are unavailable."},{status:503,headers});}
}
export async function PATCH(req:NextRequest) {
  if(!isValidAdminRequest(req)) return NextResponse.json({error:"Unauthorized"},{status:401,headers});
  const body=await req.json().catch(()=>({}));
  if(typeof body.day!=="string" || typeof body.id!=="string" || !validReviewId(body.day,body.id) || !["review","delete"].includes(body.action)) return NextResponse.json({error:"Invalid review"},{status:400,headers});
  try{await changePromptReview(body.day,body.id,body.action);return NextResponse.json({accepted:true},{headers});}
  catch{return NextResponse.json({error:"Could not update prompt review."},{status:503,headers});}
}
