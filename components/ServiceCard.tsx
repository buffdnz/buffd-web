import React from 'react';

type Step = 'service' | 'vehicle' | 'doors' | 'suburb' | 'time' | 'contact' | 'confirm';

type ServiceCardProps = {
  title: string;
  price: string;
  summary: string;
  features: string[];
  duration: string;
  bestFor: string;
  highlight?: boolean;
  isSelected?: boolean;
  step?: string;
  onSelect?: () => void;
  onContinue?: () => void;
  onBack?: () => void;
  continueLabel?: string;
  canContinue?: boolean;
  children?: React.ReactNode;
};

export default function ServiceCard({
  title,
  price,
  summary,
  features,
  duration,
  bestFor,
  highlight,
  isSelected,
  onSelect,
  onContinue,
  onBack,
  continueLabel = 'Continue',
  canContinue = true,
  children,
}: ServiceCardProps) {
  return (
    <div
      className={`h-full min-h-[480px] rounded-3xl border p-6 transition-all duration-500 ease-out ${
        isSelected
          ? 'border-[var(--accent-to)] bg-[var(--surface)] shadow-2xl'
          : 'border-[var(--border)] bg-[var(--surface)]'
      }`}
    >
      <div className="flex h-full flex-col">
        <div>
          <h3 className="text-2xl font-semibold text-[var(--text)]">{title}</h3>
          <p className="mt-1 text-lg text-[var(--text-muted)]">{price}</p>
        </div>

        <p className="mt-4 text-sm text-[var(--text-muted)]">{summary}</p>

        {!isSelected && (
          <>
            <div className="mt-4 flex flex-1 flex-col">
              <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                {features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>

              <div className="mt-6 text-sm text-[var(--text-muted)]">
                <p>Duration: {duration}</p>
                <p>Best for: {bestFor}</p>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={onSelect}
                className="w-full rounded-2xl px-5 py-3 font-medium theme-accent"
              >
                Select Service
              </button>
            </div>
          </>
        )}

        {isSelected && (
          <>
            <div className="mt-4 animate-card-open rounded-2xl border border-[var(--border)] p-4">
              {children}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:mt-auto sm:flex-row">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="w-full rounded-2xl px-5 py-3 border border-[var(--border)] font-medium text-[var(--text)]"
                >
                  Back
                </button>
              )}

              <button
                type="button"
                onClick={onContinue}
                disabled={!canContinue}
                className="w-full rounded-2xl px-5 py-3 font-medium theme-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                {continueLabel}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}