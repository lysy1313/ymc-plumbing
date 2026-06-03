"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createLeadSchema,
  LEAD_SOURCES,
  type CreateLeadFormValues,
} from "@/features/leads/schemas/lead.schema";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Input } from "@/shared/components/Input";
import { Select } from "@/shared/components/Select";
import { Textarea } from "@/shared/components/Textarea";

type Lead = CreateLeadFormValues & {
  id: string;
};

type CreateLeadFormProps = {
  onCancel: () => void;
  onSuccess: (lead: Lead) => void;
};

export function CreateLeadForm({ onCancel, onSuccess }: CreateLeadFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CreateLeadFormValues>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      source: "Phone Call",
    },
  });

  async function onSubmit(values: CreateLeadFormValues) {
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError("root", {
          message: data?.message ?? "Failed to create lead. Please try again.",
        });
        return;
      }

      onSuccess(data.lead);
    } catch {
      setError("root", {
        message: "Network error. Please try again.",
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
          Lead details
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Source"
            options={LEAD_SOURCES}
            error={errors.source?.message}
            {...register("source")}
          />
        </div>

        <div className="mt-4">
          <Textarea
            label="Issue"
            rows={4}
            error={errors.issue?.message}
            {...register("issue")}
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

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save lead"}
        </Button>
      </div>
    </form>
  );
}
