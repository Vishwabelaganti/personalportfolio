import React, { useId, useMemo, useState } from 'react';
import { formatCoordinate } from '../engine/coordinates.js';
import { COLUMNS, ROWS, isClassic } from '../engine/radix.js';

function showCell(char) {
  if (char === '\n') return '↵';
  if (char === '\t') return '⇥';
  if (/[\p{Cc}\p{Cf}]/u.test(char)) return '·';
  return /\p{M}/u.test(char) ? '◌' + char : char;
}

export function PageViewer({ page, coordinate, onStatus }) {
  const heading = useId();
  const [copyFallback, setCopyFallback] = useState(false);
  const { lines, classic } = useMemo(() => {
    const chars = Array.from(page);
    return {
      lines: Array.from({ length: ROWS }, (_, index) => chars.slice(index * COLUMNS, (index + 1) * COLUMNS)),
      classic: isClassic(chars),
    };
  }, [page]);

  async function copyCoordinate() {
    try {
      await navigator.clipboard.writeText(formatCoordinate(coordinate));
      setCopyFallback(false);
      onStatus('Coordinate copied.');
    } catch {
      setCopyFallback(true);
      onStatus('Select the coordinate below to copy it.');
    }
  }

  return (
    <section className="babel-reader" aria-labelledby={heading}>
      <div className="babel-reader-head flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 id={heading}>Page view</h2>
          <span className="babel-muted">80 columns × 40 rows</span>
        </div>
        <button type="button" className="babel-button" onClick={copyCoordinate}>Copy coordinate</button>
      </div>
      {copyFallback && (
        <input
          aria-label="Full coordinate"
          className="babel-input w-full"
          readOnly
          value={formatCoordinate(coordinate)}
          onFocus={event => event.target.select()}
        />
      )}
      <div className="babel-scroll overflow-x-auto" tabIndex={0} role="region" aria-label="Page text">
        <div className={'babel-page' + (classic ? '' : ' babel-unicode')}>
          <div className="babel-ruler babel-line" aria-hidden="true">
            <span className="babel-line-number">ln</span>
            <div className="babel-ticks relative grid grid-cols-8">
              <span className="absolute left-0">1</span>
              {Array.from({ length: 8 }, (_, index) => <span key={index} className="text-right">{(index + 1) * 10}</span>)}
            </div>
          </div>
          {lines.map((line, index) => (
            <div key={index} className="babel-line">
              <span className="babel-line-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              {classic ? <pre className="m-0">{line.join('')}</pre> : (
                <div className="babel-cells">{line.map((char, column) => (
                  <span key={column} title={showCell(char) === char ? undefined : 'U+' + char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}>
                    {showCell(char)}
                  </span>
                ))}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
