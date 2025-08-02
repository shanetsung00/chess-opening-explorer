// src/hooks/useIntersectionObserver.js
import { useState, useEffect } from 'react';

/**
 * Hook: tells you when `ref.current` enters the viewport.
 * Aggressive pre-fetch: 200 px rootMargin.
 */
const useIntersectionObserver = (
  ref,
  { threshold = 0.1, rootMargin = '200px 0px 200px 0px', ...rest } = {}
) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold, rootMargin, ...rest }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, threshold, rootMargin, rest]);

  return isVisible;
};

export default useIntersectionObserver;   // ← default export only
