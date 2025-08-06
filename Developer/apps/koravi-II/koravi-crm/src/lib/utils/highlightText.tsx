import React from 'react';

/**
 * Highlights matching text in a string based on a search query
 * @param text - The text to search in
 * @param query - The search query to highlight
 * @returns JSX element with highlighted matches
 */
export function highlightText(text: string, query: string): React.ReactNode {
  if (!query || !text) {
    return text;
  }

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (regex.test(part)) {
      return (
        <mark
          key={index}
          className="bg-yellow-200 text-yellow-900 px-0.5 rounded-sm font-medium"
        >
          {part}
        </mark>
      );
    }
    return part;
  });
}