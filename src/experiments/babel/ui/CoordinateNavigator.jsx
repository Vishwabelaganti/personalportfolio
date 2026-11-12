import React, { useId, useState } from 'react';
import { FIELDS, MAX_HEX_LENGTH, parseCoordinate, seedForCoordinate } from '../engine/coordinates.js';

export function CoordinateNavigator({ coordinate, revision, onNavigate, onRandom, onError }) {
  const id = useId();
  const [edit, setEdit] = useState(null);
  const draft = edit?.revision === revision ? edit.value : coordinate;
  const update = key => event => setEdit({ revision, value: { ...draft, [key]: event.target.value } });

  function navigate(readSeed) {
    try {
      onNavigate(readSeed());
    } catch (error) {
      onError(error.message);
    }
  }

  return (
    <form
      className="babel-navigator flex flex-wrap items-end gap-x-3 gap-y-3"
      aria-label="Coordinate navigator"
      onSubmit={event => {
        event.preventDefault();
        navigate(() => seedForCoordinate(draft));
      }}
    >
      <label className="babel-hex-field min-w-0" htmlFor={id + '-hex'}>
        <span className="babel-label">Hexagon</span>
        <input
          id={id + '-hex'}
          className="babel-input w-full"
          value={draft.hexagon}
          onChange={update('hexagon')}
          onFocus={event => event.target.select()}
          onPaste={event => {
            const pasted = event.clipboardData.getData('text').trim();
            if (!pasted.includes(':')) return;
            event.preventDefault();
            navigate(() => parseCoordinate(pasted));
          }}
          maxLength={MAX_HEX_LENGTH}
          autoCapitalize="off"
          autoComplete="off"
          spellCheck={false}
          required
        />
      </label>
      <div className="babel-numbers grid grid-cols-4 gap-2">
        {FIELDS.map(({ key, label, limit }) => (
          <label key={key} className="min-w-0" htmlFor={id + '-' + key}>
            <span className="babel-label" title={'1–' + limit}>{label}</span>
            <input
              id={id + '-' + key}
              className="babel-input w-full"
              type="number"
              min={1}
              max={limit}
              step={1}
              required
              value={draft[key]}
              onChange={update(key)}
            />
          </label>
        ))}
      </div>
      <div className="babel-nav-actions flex flex-wrap gap-2">
        <button type="submit" className="babel-button">Go</button>
        <button type="button" className="babel-button" onClick={onRandom}>Random Coordinate</button>
      </div>
    </form>
  );
}
