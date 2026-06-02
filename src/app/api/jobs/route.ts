import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createJob, getJobs } from "@/server/services/jobs.service";

export async function GET() {
  try {
    const jobs = await getJobs();

    return NextResponse.json({
      jobs,
    });
  } catch {
    return NextResponse.json(
      {
        message: "Failed to load jobs",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const job = await createJob(body);

    return NextResponse.json(
      {
        job,
        message: "Job created successfully",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: error.flatten().fieldErrors,
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(
      {
        message: "Failed to create job",
      },
      {
        status: 500,
      },
    );
  }
}
