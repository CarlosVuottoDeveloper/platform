import type { CSSProperties, ReactNode } from 'react';

export interface Step {
  label?: ReactNode;
}

export interface StepperProps {
  steps?: (string | Step)[];
  /** Zero-based index of the current step. Earlier steps read as done. */
  current?: number;
  style?: CSSProperties;
}

function resolveStep(step: string | Step): Step {
  return typeof step === 'string' ? { label: step } : step;
}

export function Stepper({ steps = [], current = 0, style }: StepperProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', ...style }}>
      {steps.map((step, index) => {
        const { label } = resolveStep(step);
        const done = index < current;
        const isCurrent = index === current;

        return (
          <div
            key={typeof label === 'string' ? label : index}
            aria-current={isCurrent ? 'step' : undefined}
            style={{
              flex: 1,
              display: 'grid',
              gap: 'var(--space-2)',
              justifyItems: 'center',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            {index > 0 ? (
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 13,
                  left: 0,
                  right: '50%',
                  height: 1,
                  background: 'var(--color-divider)',
                }}
              />
            ) : null}
            {index < steps.length - 1 ? (
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 13,
                  left: '50%',
                  right: 0,
                  height: 1,
                  background: 'var(--color-divider)',
                }}
              />
            ) : null}
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                width: 28,
                height: 28,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 'var(--radius-pill)',
                background: isCurrent
                  ? 'var(--color-accent)'
                  : done
                    ? 'var(--color-accent-700)'
                    : 'var(--color-surface-2)',
                borderWidth: isCurrent || done ? 0 : 1,
                borderStyle: 'solid',
                borderColor: 'var(--color-control-border)',
                fontSize: 12,
                color: isCurrent
                  ? 'var(--color-bg)'
                  : done
                    ? 'var(--color-text)'
                    : 'var(--color-neutral-400)',
              }}
            >
              {done ? '✓' : index + 1}
            </div>
            <div
              style={{
                fontSize: 'var(--text-h6)',
                color: isCurrent
                  ? 'var(--color-text)'
                  : done
                    ? 'var(--color-neutral-200)'
                    : 'var(--color-neutral-400)',
              }}
            >
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
