import { SelectHTMLAttributes } from "react";

type AppSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  options: readonly string[];
};

export function Select({
  label,
  error,
  options,
  className = "",
  ...props
}: AppSelectProps) {
  const inputBorderClass = error
    ? "border-red-500 focus:border-red-500 focus:ring-red-100"
    : "border-slate-300 focus:border-cyan-600 focus:ring-cyan-100";

  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <select
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-cyan-600 text-black ${inputBorderClass} ${className}`}
        {...props}
      >
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error ? (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      ) : null}
    </label>
  );
}
