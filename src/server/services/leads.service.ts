import { createLeadSchema } from "@/features/leads/schemas/lead.schema";
import { prisma } from "@/server/db/prisma";

export async function getLeads() {
  return prisma.lead.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          jobs: true,
        },
      },
    },
  });
}

export async function createLead(input: unknown) {
  const data = createLeadSchema.parse(input);

  const existingLead = await prisma.lead.findFirst({
    where: {
      OR: [
        { phone: data.phone },
        ...(data.email ? [{ email: data.email }] : []),
      ],
    },
  });

  if (existingLead) {
    throw new Error("DUPLICATE_LEAD");
  }

  return prisma.lead.create({
    data: {
      ...data,
      email: data.email || null,
    },
  });
}
