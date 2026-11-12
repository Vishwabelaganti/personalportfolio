import { probeSuggestions } from './probes.js';

// Retain only the latest pending request when typing outruns coordinate resolution.
let pending;
let scheduled = false;
self.onmessage = ({ data }) => {
  pending = data;
  if (scheduled) return;
  scheduled = true;
  setTimeout(() => {
    const { id, input, mode, exact, key } = pending;
    scheduled = false;
    try {
      self.postMessage({ id, key, results: probeSuggestions(input, mode, exact) });
    } catch {
      self.postMessage({ id, key, results: [] });
    }
  }, 0);
};
