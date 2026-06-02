import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { updateJobStatus } from "@/server/services/jobs.service";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const job = await updateJobStatus(id, body);

    return NextResponse.json({
      job,
      message: "Status updated successfully",
    });
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
        message: "Failed to update status",
      },
      {
        status: 500,
      },
    );
  }
}
