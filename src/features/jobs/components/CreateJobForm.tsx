"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createJobSchema,
  type CreateJobFormValues,
} from "@/features/jobs/schemas/job.schema";
import {
  JOB_SOURCES,
  JOB_TYPES,
  TECHNICIANS,
} from "@/features/jobs/types/job.types";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Input } from "@/shared/components/Input";
import { Select } from "@/shared/components/Select";
import { Textarea } from "@/shared/components/Textarea";
import { Lead } from "@/features/leads/types/lead.types";

type CreateJobFormProps = {
  lead: Lead;
  onSuccess: () => void;
  onCancel: () => void;
};

export function CreateJobForm({
  lead,
  onSuccess,
  onCancel,
}: CreateJobFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CreateJobFormValues>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      leadId: lead.id,
      firstName: lead.firstName,
      lastName: lead.lastName,
      phone: lead.phone,
      email: lead.email ?? "",
      jobSource: lead.source as CreateJobFormValues["jobSource"],
      description: lead.issue,
      address: lead.address,
      city: lead.city,
      zipCode: lead.zipCode,
      area: lead.area ?? "",
    },
  });

  async function onSubmit(values: CreateJobFormValues) {
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        setError("root", {
          message: data?.message ?? "Failed to create job. Please try again.",
        });

        return;
      }

      onSuccess();
    } catch {
      setError("root", {
        message: "Network error. Please check the server and try again.",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {errors.root?.message ? (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {errors.root.message}
        </div>
      ) : null}

      <Card>
        <h3 className="mb-4 text-lg font-semibold text-slate-950">
          Client details
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="First name"
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <Input
            label="Last name"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
          <Input
            label="Phone"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <Input
            label="Email"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 text-lg font-semibold text-slate-950">
          Job details
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Job type"
            options={JOB_TYPES}
            error={errors.jobType?.message}
            {...register("jobType")}
          />
          <Select
            label="Job source"
            options={JOB_SOURCES}
            error={errors.jobSource?.message}
            {...register("jobSource")}
          />
        </div>

        <div className="mt-4">
          <Textarea
            label="Job description"
            rows={4}
            error={errors.description?.message}
            {...register("description")}
          />
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 text-lg font-semibold text-slate-950">
          Service location
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Address"
            error={errors.address?.message}
            {...register("address")}
          />
          <Input
            label="City"
            error={errors.city?.message}
            {...register("city")}
          />
          <Input
            label="Zip code"
            error={errors.zipCode?.message}
            {...register("zipCode")}
          />
          <Input
            label="Area"
            error={errors.area?.message}
            {...register("area")}
          />
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 text-lg font-semibold text-slate-950">Scheduled</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Start date"
            type="date"
            error={errors.startDate?.message}
            {...register("startDate")}
          />
          <Input
            label="Start time"
            type="time"
            error={errors.startTime?.message}
            {...register("startTime")}
          />
          <Input
            label="End time"
            type="time"
            error={errors.endTime?.message}
            {...register("endTime")}
          />
          <Select
            label="Assigned technician"
            options={TECHNICIANS}
            error={errors.technician?.message}
            {...register("technician")}
          />
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save job"}
        </Button>
      </div>
    </form>
  );
}
