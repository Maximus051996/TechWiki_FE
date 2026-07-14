'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Typewriter for the "TechWiki" wordmark on the login page.
 * Types the word out, holds, erases, and loops — with a blinking caret.
 * Keeps its own state + timer (driven once via a ref) so parent re-renders
 * (e.g. typing in the email field) never restart or glitch the animation.
 *
 * "Tech" renders pink, "Wiki" white — coloured by character index.
 */
const WORD = 'TechWiki';
const SPLIT = 4; // first 4 chars = "Tech"

export function Typewriter() {
  const [count, setCount] = useState(0);
  const state = useRef({ i: 0, dir: 1 as 1 | -1 });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const s = state.current;
      s.i += s.dir;

      let delay = 130; // typing speed
      if (s.i >= WORD.length) {
        s.i = WORD.length;
        s.dir = -1;
        delay = 1800; // hold when fully typed
      } else if (s.i <= 0) {
        s.i = 0;
        s.dir = 1;
        delay = 700; // pause before retyping
      } else if (s.dir === -1) {
        delay = 70; // erase faster
      }

      setCount(s.i);
      timer = setTimeout(tick, delay);
    };

    timer = setTimeout(tick, 500);
    return () => clearTimeout(timer);
  }, []);

  const typed = WORD.slice(0, count);
  const tech = typed.slice(0, SPLIT);
  const wiki = typed.slice(SPLIT);

  return (
    <span className="typewriter" aria-label={WORD}>
      <span className="wb-tech">{tech}</span>
      <span className="wb-wiki">{wiki}</span>
      <span className="tw-caret" aria-hidden="true" />
    </span>
  );
}
