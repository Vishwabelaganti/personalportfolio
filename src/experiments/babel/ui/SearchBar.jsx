import React, { useId, useMemo, useState } from 'react';
import { ORDERED, RAW } from '../engine/library.js';
import { probeNextWords } from '../engine/probes.js';

export function SearchBar({ mode, onModeChange, onLookup, onProbe }) {
  const id = useId();
  const listId = id + '-suggestions';
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const results = useMemo(() => open ? probeNextWords(input, mode) : [], [input, mode, open]);
  const expanded = results.length > 0;

  function close() {
    setOpen(false);
    setActive(-1);
  }

  function select(result) {
    setInput(result.phrase);
    close();
    onProbe(result);
  }

  function submit(event) {
    event.preventDefault();
    if (onLookup(input)) close();
  }

  function handleKey(event) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Escape' && expanded) {
      event.preventDefault();
      close();
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return;
      if (!expanded) {
        if (event.key === 'ArrowDown') {
          setOpen(true);
          setActive(0);
        }
        return;
      }
      event.preventDefault();
      const next = event.key === 'ArrowDown' ? active + 1 : active < 0 ? results.length - 1 : active - 1;
      setActive((next + results.length) % results.length);
    } else if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (expanded && results[active]) select(results[active]);
      else if (onLookup(input)) close();
    }
  }

  return (
    <div className="babel-topbar flex flex-wrap items-end gap-x-6 gap-y-4">
      <form className="babel-search relative min-w-0 flex-1" onSubmit={submit}>
        <label className="babel-label" htmlFor={id}>Find text</label>
        <div className="flex min-w-0 gap-2">
          <textarea
            id={id}
            className="babel-input babel-query min-w-0 flex-1"
            rows={1}
            value={input}
            placeholder="e.g. in the"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={expanded}
            aria-controls={expanded ? listId : undefined}
            aria-activedescendant={expanded && results[active] ? listId + '-' + active : undefined}
            onFocus={() => setOpen(true)}
            onBlur={close}
            onChange={event => {
              setInput(event.target.value);
              setActive(-1);
              setOpen(true);
            }}
            onKeyDown={handleKey}
          />
          <button type="submit" className="babel-button babel-primary">Search</button>
        </div>
        {expanded && (
          <ul id={listId} className="babel-probes absolute inset-x-0 z-10 m-0 list-none p-0" role="listbox" aria-label="Next word suggestions">
            {results.map(({ word, phrase, badge }, index) => (
              <li
                key={word}
                id={listId + '-' + index}
                className="babel-probe flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-1"
                role="option"
                aria-selected={active === index}
                onMouseDown={event => event.preventDefault()}
                onClick={() => select(results[index])}
              >
                <span className="babel-completion truncate">
                  <span className="babel-muted">{phrase.slice(0, -word.length)}</span><strong>{word}</strong>
                </span>
                <span className="babel-badge" aria-hidden="true" title="Hexagon · Wall · Shelf · Volume · Page">
                  H {badge.hexagon} · W{badge.wall} S{badge.shelf} V{badge.volume} P{badge.page}
                </span>
                <span className="sr-only">Hexagon {badge.hexagon}, wall {badge.wall}, shelf {badge.shelf}, volume {badge.volume}, page {badge.page}</span>
              </li>
            ))}
          </ul>
        )}
      </form>
      <fieldset className="babel-mode m-0 min-w-0 border-0 p-0">
        <legend className="babel-label">Space</legend>
        <div className="babel-segment flex">
          {[[ORDERED, 'Ordered'], [RAW, 'Universal Raw']].map(([value, label]) => (
            <button key={value} type="button" className="babel-button" aria-pressed={mode === value} onClick={() => onModeChange(value)}>
              {label}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
