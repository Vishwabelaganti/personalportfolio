import React, { useEffect, useRef, useState } from 'react';

export function LibraryScene({ coordinate, onSelect }) {
  const host = useRef(null);
  const scene = useRef(null);
  const latest = useRef({ coordinate, onSelect });
  latest.current = { coordinate, onSelect };
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [hover, setHover] = useState('');

  useEffect(() => {
    let cancelled = false;
    import('../scene/library-scene.js').then(({ createLibraryScene }) => {
      if (cancelled) return;
      try {
        scene.current = createLibraryScene(host.current, selection => latest.current.onSelect(selection), setHover, () => setFailed(true));
        scene.current.select(latest.current.coordinate);
        setReady(true);
      } catch {
        setFailed(true);
      }
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; scene.current?.dispose(); scene.current = null; };
  }, []);

  useEffect(() => { scene.current?.select(coordinate); }, [coordinate]);

  return (
    <section className="babel-library" aria-label="Explore the library">
      <div className="babel-reader-head flex flex-wrap items-center justify-between gap-2">
        <h2>Explore the library</h2>
        <div className="flex gap-2">
          <button type="button" className="babel-button" disabled={!ready || failed} onClick={() => scene.current?.overview()}>All walls</button>
          <button type="button" className="babel-button" disabled={!ready || failed} onClick={() => scene.current?.focus()}>Face this wall</button>
        </div>
      </div>
      <div className="babel-library-layout">
        <div className="babel-scene-wrap">
          <div ref={host} className="babel-scene" />
          {(!ready || failed) && <p className="babel-scene-message">{failed ? '3D view unavailable. Use the wall, shelf, and book controls to browse.' : 'Opening the library…'}</p>}
          <p className="babel-scene-hint">{hover || 'Drag to look around · Click a book to open it'}</p>
        </div>
        <div className="babel-library-picker">
          <fieldset>
            <legend>Wall</legend>
            <div className="babel-wall-buttons">
              {[1, 2, 3, 4].map(wall => <button type="button" key={wall} aria-pressed={wall === coordinate.wall} onClick={() => onSelect({ wall })}>{wall}</button>)}
            </div>
          </fieldset>
          <fieldset>
            <legend>Shelf</legend>
            <div className="babel-shelf-buttons">
              {[1, 2, 3, 4, 5].map(shelf => <button type="button" key={shelf} aria-pressed={shelf === coordinate.shelf} onClick={() => onSelect({ shelf })}>{shelf}</button>)}
            </div>
          </fieldset>
          <fieldset>
            <legend>Book <strong>{coordinate.volume}</strong> of 32</legend>
            <div className="babel-book-buttons">
              {Array.from({ length: 32 }, (_, index) => index + 1).map(volume => (
                <button type="button" key={volume} aria-label={'Open book ' + volume} aria-pressed={volume === coordinate.volume} onClick={() => onSelect({ volume })}>{volume}</button>
              ))}
            </div>
          </fieldset>
          <p className="babel-location">Wall {coordinate.wall} / Shelf {coordinate.shelf}<br />Book {coordinate.volume} / Page {coordinate.page}</p>
        </div>
      </div>
    </section>
  );
}
