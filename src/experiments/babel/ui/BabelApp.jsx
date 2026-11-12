import React, { useEffect, useMemo, useRef, useState } from 'react';
import { COORDINATE_HASH, coordinateForSeed, formatCoordinate, parseCoordinate, seedForCoordinate } from '../engine/coordinates.js';
import { searchText, modeForSeed, nextBrowseSeed, ORDERED, pageForSeed } from '../engine/library.js';
import { CoordinateNavigator } from './CoordinateNavigator.jsx';
import { PageViewer } from './PageViewer.jsx';
import { SearchBar } from './SearchBar.jsx';
import { LibraryScene } from './LibraryScene.jsx';

const START_SEED = nextBrowseSeed(0n, ORDERED);

export function BabelApp({ syncHash = false }) {
  const [seed, setSeed] = useState(START_SEED);
  const [navigationCount, setNavigationCount] = useState(0);
  const [notice, setNotice] = useState({ text: '', error: false });
  const [exactOnly, setExactOnly] = useState(false);
  const [lastSearch, setLastSearch] = useState('');
  const reader = useRef(null);
  const mode = modeForSeed(seed);
  const coordinate = useMemo(() => coordinateForSeed(seed), [seed]);
  const page = useMemo(() => pageForSeed(seed), [seed]);

  useEffect(() => {
    if (lastSearch) reader.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [lastSearch, seed]);

  function status(text, error = false) {
    setNotice({ text, error });
  }

  useEffect(() => {
    if (!syncHash) return undefined;
    function restore() {
      const hash = window.location.hash;
      if (hash && !hash.startsWith(COORDINATE_HASH)) return;
      try {
        setSeed(hash ? parseCoordinate(hash.slice(COORDINATE_HASH.length)) : START_SEED);
        setNavigationCount(count => count + 1);
        setLastSearch('');
        setNotice({ text: '', error: false });
      } catch (error) {
        setNotice({ text: error.message, error: true });
      }
    }
    restore();
    window.addEventListener('hashchange', restore);
    return () => window.removeEventListener('hashchange', restore);
  }, [syncHash]);

  function navigate(target, message = 'Coordinate opened.') {
    setSeed(target);
    setNavigationCount(count => count + 1);
    status(message);
    setLastSearch('');
    if (syncHash) {
      const hash = COORDINATE_HASH + formatCoordinate(coordinateForSeed(target));
      if (window.location.hash !== hash) window.history.pushState(null, '', hash);
    }
  }

  function openSearch(target, phrase) {
    navigate(target.seed, target.mode !== mode
      ? 'Text found in Universal Raw. Your match is highlighted below.'
      : 'Text found. Your match is highlighted below.');
    setLastSearch(phrase);
  }

  function search(input, exact = exactOnly) {
    try {
      openSearch(searchText(input, mode, exact), input);
      return true;
    } catch (error) {
      status(error.message, true);
      return false;
    }
  }

  function selectLocation(selection) {
    try {
      navigate(seedForCoordinate({ ...coordinate, ...selection }), 'Book opened. Read its page below.');
    } catch (error) {
      status(error.message, true);
    }
  }

  return (
    <div className="babel-app">
      <div className="babel-controls">
        <SearchBar
          mode={mode}
          exact={exactOnly}
          onExactChange={value => {
            setExactOnly(value);
            if (lastSearch) search(lastSearch, value);
          }}
          onModeChange={target => {
            if (target !== mode) navigate(nextBrowseSeed(seed, target));
          }}
          onLookup={search}
          onProbe={target => openSearch(target, target.phrase)}
        />
        <details className="babel-coordinate-details">
          <summary>Coordinate navigator</summary>
          <CoordinateNavigator
            coordinate={coordinate}
            revision={navigationCount}
            onNavigate={navigate}
            onRandom={() => navigate(nextBrowseSeed(seed), 'Random coordinate opened.')}
            onError={message => status(message, true)}
          />
        </details>
      </div>
      <p className={'babel-status m-0' + (notice.error ? ' babel-error' : '')} role="status">{notice.text}</p>
      <LibraryScene coordinate={coordinate} onSelect={selectLocation} />
      <div ref={reader}>
        <PageViewer
          key={seed.toString(36)}
          page={page}
          coordinate={coordinate}
          onStatus={status}
          matchLength={Array.from(lastSearch).length}
          exact={exactOnly}
          onTurn={direction => selectLocation({ page: coordinate.page + direction })}
        />
      </div>
    </div>
  );
}
