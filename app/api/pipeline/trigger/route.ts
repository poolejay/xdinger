import { exec } from "child_process";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-pipeline-secret");
  if (secret !== process.env.PIPELINE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  exec("python3 scripts/pipeline/run_pipeline.py", { cwd: process.cwd() }, (error, stdout) => {
    if (error) console.error("Pipeline error:", error);
    if (stdout) console.log("Pipeline output:", stdout);
  });

  return NextResponse.json({ message: "Pipeline triggered" });
}
