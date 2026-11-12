import { forwardRef, useRef, useState } from 'react';
import type {
  ClipboardEvent,
  CSSProperties,
  DragEvent,
  HTMLAttributes,
  KeyboardEvent,
  ReactNode,
} from 'react';
import { FIELD_ERROR_STYLE, FIELD_HINT_STYLE } from './fieldFrame';
import { Icon } from './Icon';

export interface RejectedFile {
  file: File;
  reason: 'type' | 'size';
}

export interface FileDropProps extends Omit<HTMLAttributes<HTMLLabelElement>, 'style' | 'onDrop'> {
  label?: string;
  hint?: ReactNode;
  error?: ReactNode;
  /** Comma-separated MIME types/extensions, same syntax as the native `accept` attribute — also used to validate files before `onFiles` fires. */
  accept?: string;
  multiple?: boolean;
  maxSizeBytes?: number;
  disabled?: boolean;
  onFiles?: (files: File[]) => void;
  /** Files rejected by `accept`/`maxSizeBytes`, with the reason. */
  onReject?: (rejected: RejectedFile[]) => void;
  style?: CSSProperties;
}

function matchesAccept(file: File, accept?: string): boolean {
  if (!accept) return true;
  const patterns = accept.split(',').map((p) => p.trim().toLowerCase());
  return patterns.some((pattern) => {
    if (pattern.startsWith('.')) return file.name.toLowerCase().endsWith(pattern);
    if (pattern.endsWith('/*')) return file.type.startsWith(pattern.slice(0, -1));
    return file.type.toLowerCase() === pattern;
  });
}

export function partitionFiles(
  files: File[],
  accept: string | undefined,
  maxSizeBytes: number | undefined,
): { accepted: File[]; rejected: RejectedFile[] } {
  const accepted: File[] = [];
  const rejected: RejectedFile[] = [];
  for (const file of files) {
    if (!matchesAccept(file, accept)) rejected.push({ file, reason: 'type' });
    else if (maxSizeBytes && file.size > maxSizeBytes) rejected.push({ file, reason: 'size' });
    else accepted.push(file);
  }
  return { accepted, rejected };
}

/** Dashed drop zone for file uploads. */
export const FileDrop = forwardRef<HTMLLabelElement, FileDropProps>(function FileDrop(
  {
    label = 'Arraste um arquivo ou clique para escolher',
    hint = 'PNG, JPG ou PDF até 10 MB',
    error,
    accept,
    multiple,
    maxSizeBytes,
    disabled = false,
    onFiles,
    onReject,
    style,
    ...rest
  },
  ref,
) {
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: File[]) => {
    if (disabled || !files.length) return;
    const { accepted, rejected } = partitionFiles(files, accept, maxSizeBytes);
    if (accepted.length) onFiles?.(accepted);
    if (rejected.length) onReject?.(rejected);
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setOver(false);
    if (disabled) return;
    handleFiles(Array.from(e.dataTransfer.files));
  };

  const onPaste = (e: ClipboardEvent<HTMLLabelElement>) => {
    if (disabled) return;
    const files = Array.from(e.clipboardData?.files ?? []);
    if (files.length) handleFiles(files);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLLabelElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  const borderColor = error
    ? 'var(--color-danger)'
    : over
      ? 'var(--color-accent)'
      : 'var(--color-divider-strong)';

  return (
    <div style={{ display: 'grid', gap: 6, ...style }}>
      <label
        ref={ref}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-disabled={disabled || undefined}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        onPaste={onPaste}
        onKeyDown={onKeyDown}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-8) var(--space-6)',
          textAlign: 'center',
          borderRadius: 'var(--radius-lg)',
          background: over ? 'var(--color-surface-2)' : 'var(--color-surface)',
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor,
          opacity: disabled ? 0.45 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        {...rest}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }}
          onChange={(e) => {
            handleFiles(Array.from(e.target.files ?? []));
            e.target.value = '';
          }}
        />
        <Icon name="upload" size="lg" color="var(--color-text)" />
        <span
          style={{
            fontSize: 'var(--text-body)',
            fontWeight: 'var(--font-medium-weight)',
            color: 'var(--color-text)',
          }}
        >
          {label}
        </span>
        <span
          style={{
            ...FIELD_HINT_STYLE,
            textAlign: 'center',
          }}
        >
          {hint}
        </span>
      </label>
      {error ? <span style={FIELD_ERROR_STYLE}>{error}</span> : null}
    </div>
  );
});
