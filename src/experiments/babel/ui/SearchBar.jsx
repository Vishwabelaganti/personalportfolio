import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ORDERED, RAW } from '../engine/library.js';
import { suggestWords } from '../engine/probes.js';

export function SearchBar({ mode, exact, onExactChange, onModeChange, onLookup, onProbe }) {
  const id = useId();
  const listId = id + '-suggestions';
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [resolved, setResolved] = useState({ id: 0, results: [] });
  const worker = useRef(null);
  const request = useRef(0);
  const queryKey = JSON.stringify([input, mode, exact]);
  const suggestions = useMemo(() => open ? suggestWords(input) : [], [input, open]);
  const expanded = suggestions.length > 0;

  useEffect(() => {
    try {
      const instance = new Worker(new URL('../engine/probe.worker.js', import.meta.url), { type: 'module' });
      worker.current = instance;
      instance.onmessage = ({ data }) => {
        if (data.id === request.current) setResolved(data);
      };
      return () => { instance.terminate(); worker.current = null; };
    } catch {
      // Suggestions and direct search still work when workers are unavailable.
      return undefined;
    }
  }, []);

  useEffect(() => {
    const id = ++request.current;
    if (suggestions.length) worker.current?.postMessage({ id, input, mode, exact, key: queryKey });
    setResolved({ id, results: [] });
  }, [input, mode, exact, suggestions, queryKey]);

  const targets = resolved.key === queryKey ? resolved.results : [];

  function close() {
    setOpen(false);
    setActive(-1);
  }

  function select(candidate) {
    const target = targets.find(result => result.phrase === candidate.phrase);
    const succeeded = target ? (onProbe(target), true) : onLookup(candidate.phrase);
    if (succeeded) {
      setInput(candidate.phrase);
      close();
    }
  }

  function handleKey(event) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Escape' && expanded) {
      event.preventDefault();
      close();
    } else if (event.key === 'Tab' && !event.shiftKey && expanded) {
      event.preventDefault();
      setInput(suggestions[Math.max(active, 0)].phrase + ' ');
      setActive(-1);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey || !expanded) return;
      event.preventDefault();
      const next = event.key === 'ArrowDown' ? active + 1 : active < 0 ? suggestions.length - 1 : active - 1;
      setActive((next + suggestions.length) % suggestions.length);
    } else if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (expanded && suggestions[active]) select(suggestions[active]);
      else if (onLookup(input)) close();
    }
  }

  return (
    <div className="babel-topbar flex flex-wrap items-start gap-x-6 gap-y-4">
      <form className="babel-search relative min-w-0 flex-1" onSubmit={event => {
        event.preventDefault();
        if (onLookup(input)) close();
      }}>
        <label className="babel-label" htmlFor={id}>Find text in the library</label>
        <div className="relative">
          <div className="flex min-w-0 gap-2">
            <textarea
              id={id}
              className="babel-input babel-query min-w-0 flex-1"
              rows={1}
              value={input}
              placeholder="Start a word or phrase…"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={expanded}
              aria-controls={expanded ? listId : undefined}
              aria-describedby={id + '-help'}
              aria-activedescendant={expanded && suggestions[active] ? listId + '-' + active : undefined}
              onFocus={() => setOpen(true)}
              onBlur={close}
              onChange={event => { setInput(event.target.value); setActive(-1); setOpen(true); }}
              onKeyDown={handleKey}
            />
            <button type="submit" className="babel-button babel-primary">Search</button>
          </div>
          {expanded && (
            <ul id={listId} className="babel-probes absolute inset-x-0 z-10 m-0 list-none p-0" role="listbox" aria-label="Word completions and next words">
              {suggestions.map((candidate, index) => {
                const badge = targets.find(result => result.phrase === candidate.phrase)?.badge;
                return (
                  <li
                    key={candidate.phrase}
                    id={listId + '-' + index}
                    className="babel-probe flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-1"
                    role="option"
                    aria-selected={active === index}
                    onMouseDown={event => event.preventDefault()}
                    onClick={() => select(candidate)}
                  >
                    <span className="babel-completion truncate">
                      <span className="babel-muted">{input}</span><strong>{candidate.phrase.slice(input.length)}</strong>
                    </span>
                    {badge && <span className="babel-badge" title="Hexagon · Wall · Shelf · Volume · Page">
                      H {badge.hexagon} · W{badge.wall} S{badge.shelf} V{badge.volume} P{badge.page}
                    </span>}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <p id={id + '-help'} className="babel-search-help">Tab completes · Space suggests a next word · Enter opens</p>
        <label className="babel-exact-option">
          <input type="checkbox" checked={exact} onChange={event => onExactChange(event.target.checked)} />
          Exact text only <span className="babel-muted">(pad the rest with spaces)</span>
        </label>
      </form>
      <fieldset className="babel-mode m-0 min-w-0 border-0 p-0">
        <legend className="babel-label">Space</legend>
        <div className="babel-segment flex">
          {[[ORDERED, 'Ordered'], [RAW, 'Universal Raw']].map(([value, label]) => (
            <button key={value} type="button" className="babel-button" aria-pressed={mode === value} onClick={() => onModeChange(value)}>{label}</button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
