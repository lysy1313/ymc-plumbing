import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Input({ label, error, className = "", ...props }: InputProps) {
  const inputBorderClass = error
    ? "border-red-500 focus:border-red-500 focus:ring-red-100"
    : "border-slate-300 focus:border-cyan-600 focus:ring-cyan-100";

  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        className={` w-full rounded-lg border  px-3 py-2 text-sm outline-none focus:border-cyan-600 text-black ${inputBorderClass} ${className}`}
        {...props}
      />
      {error ? (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      ) : null}
    </label>
  );
}
