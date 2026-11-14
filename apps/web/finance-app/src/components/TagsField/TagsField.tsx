import { useId, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Badge, TextField } from '@industry/web';
import { TAGS_MAX_COUNT, normalizeTag } from '../../domain/tag';

interface TagsFieldProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
}

export function TagsField({ value, onChange, suggestions }: TagsFieldProps) {
  const listId = useId();
  const [text, setText] = useState('');
  const isFull = value.length >= TAGS_MAX_COUNT;

  function addTag(input: string) {
    const tag = normalizeTag(input);
    setText('');
    if (tag === null || value.includes(tag)) return;
    onChange([...value, tag]);
  }

  function handleChange(nextText: string) {
    if (nextText.endsWith(',')) {
      addTag(nextText.slice(0, -1));
      return;
    }
    setText(nextText);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    addTag(text);
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
      <TextField
        label="Tags"
        hint={isFull ? `Limite de ${TAGS_MAX_COUNT} tags` : 'Enter ou vírgula para adicionar'}
        value={text}
        list={listId}
        disabled={isFull}
        onChange={(event) => handleChange(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <datalist id={listId}>
        {suggestions
          .filter((suggestion) => !value.includes(suggestion))
          .map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
      </datalist>
      {value.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {value.map((tag) => (
            <Badge key={tag} tone="accent">
              {tag}
              <button
                type="button"
                aria-label={`Remover tag ${tag}`}
                onClick={() => onChange(value.filter((existing) => existing !== tag))}
                style={{
                  marginLeft: 'var(--space-1)',
                  padding: 0,
                  border: 0,
                  background: 'none',
                  color: 'inherit',
                  font: 'inherit',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
