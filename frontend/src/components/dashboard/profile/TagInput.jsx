'use client';
import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const MAX_TAG_LENGTH = 40;

const TagInput = ({ id, values, onChange, placeholder, max = 30 }) => {
  const [draft, setDraft] = useState('');
  const isFull = values.length >= max;

  const add = () => {
    const tag = draft.trim().replace(/,$/, '').slice(0, MAX_TAG_LENGTH);
    const exists = values.some((v) => v.toLowerCase() === tag.toLowerCase());
    if (tag && !exists && !isFull) onChange([...values, tag]);
    setDraft('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      add();
    } else if (event.key === 'Backspace' && !draft && values.length) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-secondary/20 p-4">
      <div className="flex gap-2">
        <Input
          id={id}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => draft.trim() && add()}
          disabled={isFull}
          placeholder={isFull ? `Up to ${max} items` : placeholder}
          className="bg-background"
        />
        <Button
          type="button"
          variant="outline"
          onClick={add}
          disabled={!draft.trim() || isFull}
          className="shrink-0 gap-1.5 border-border"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
      {values.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <Badge
              key={value}
              className="gap-1 border border-border bg-background/80 px-2 py-1 text-foreground"
            >
              {value}
              <button
                type="button"
                onClick={() => onChange(values.filter((v) => v !== value))}
                aria-label={`Remove ${value}`}
                className="rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-xs italic text-muted-foreground">
          Nothing added yet.
        </p>
      )}
    </div>
  );
};

export default TagInput;
