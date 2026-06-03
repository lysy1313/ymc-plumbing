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

  return prisma.lead.create({
    data: {
      ...data,
      email: data.email || null,
    },
  });
}
