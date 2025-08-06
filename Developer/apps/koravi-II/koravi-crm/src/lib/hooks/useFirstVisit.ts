'use client';

import { useEffect, useState } from 'react';

const VISITED_PAGES_KEY = 'koravi-visited-pages';

export function useFirstVisit(pageKey: string) {
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    // Get visited pages from sessionStorage (resets on browser close)
    const visitedPages = JSON.parse(
      sessionStorage.getItem(VISITED_PAGES_KEY) || '[]'
    );

    if (!visitedPages.includes(pageKey)) {
      // This is the first visit to this page in this session
      visitedPages.push(pageKey);
      sessionStorage.setItem(VISITED_PAGES_KEY, JSON.stringify(visitedPages));
      setIsFirstVisit(true);
    } else {
      // Already visited this page in this session
      setIsFirstVisit(false);
    }
  }, [pageKey]);

  return isFirstVisit;
}