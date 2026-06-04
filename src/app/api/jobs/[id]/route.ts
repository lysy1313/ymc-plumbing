import { deleteJob, JobNotFoundError } from "@/server/services/jobs.service";
import { NextResponse } from "next/server";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const result = await deleteJob(id);

    return NextResponse.json({
      message: "Job deleted successfully",
      job: result.job,
      googleSheetsResult: result.googleSheetsResult,
    });
  } catch (error) {
    if (error instanceof JobNotFoundError) {
      return NextResponse.json(
        {
          message: error.message,
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        message: "Failed to delete job",
      },
      {
        status: 500,
      },
    );
  }
}
