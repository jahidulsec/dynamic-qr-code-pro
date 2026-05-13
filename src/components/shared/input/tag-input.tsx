"use client";

import { X } from "lucide-react";
import React, { useState, useEffect } from "react";

type Tag = {
  slug?: string;
  name: string;
};

interface TagInputProps {
  value?: Tag[];
  onChange?: (tags: Tag[]) => void;
  fetchSuggestions?: (query: string) => Promise<Tag[]>;
}

export default function TagInput({
  value = [],
  onChange,
  fetchSuggestions,
}: TagInputProps) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<Tag[]>([]);

  // fetch suggestions
  useEffect(() => {
    const load = async () => {
      if (!input || !fetchSuggestions) return;
      const res = await fetchSuggestions(input);
      setSuggestions(res);
    };

    const debounce = setTimeout(load, 300);
    return () => clearTimeout(debounce);
  }, [input]);

  const addTag = (tag: Tag) => {
    if (value.find((t) => t.name === tag.name)) return;
    onChange?.([...value, tag]);
    setInput("");
    setSuggestions([]);
  };

  const removeTag = (name: string) => {
    onChange?.(value.filter((t) => t.name !== name));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      addTag({ name: input.trim() });
    }
  };

  return (
    <div className="border rounded-md p-2 space-y-2">
      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <span
            key={tag.name}
            className="bg-primary/10 text-primary px-2 py-1 rounded text-sm flex items-center gap-1"
          >
            {tag.name}
            <button type="button" onClick={() => removeTag(tag.name)}>
              <X size={12} />
            </button>
          </span>
        ))}
      </div>

      {/* Input */}
      <input
        className="w-full outline-none text-sm"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type and press Enter..."
      />

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="border rounded-md bg-white shadow">
          {suggestions.map((s) => (
            <div
              key={s.name}
              onClick={() => addTag(s)}
              className="px-3 py-2 cursor-pointer hover:bg-muted"
            >
              {s.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
