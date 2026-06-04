import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createLead, getLeads } from "@/server/services/leads.service";

export async function GET() {
  try {
    const leads = await getLeads();

    return NextResponse.json({
      leads,
    });
  } catch {
    return NextResponse.json(
      {
        message: "Failed to load leads",
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
    const lead = await createLead(body);

    return NextResponse.json(
      {
        lead,
        message: "Lead created successfully",
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

    if (error instanceof Error && error.message === "DUPLICATE_LEAD") {
      return NextResponse.json(
        {
          message: "A lead with this phone or email already exists",
        },
        {
          status: 409,
        },
      );
    }

    return NextResponse.json(
      {
        message: "Failed to create lead",
      },
      {
        status: 500,
      },
    );
  }
}
