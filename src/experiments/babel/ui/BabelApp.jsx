import React, { useEffect, useMemo, useState } from 'react';
import { COORDINATE_HASH, coordinateForSeed, formatCoordinate, parseCoordinate } from '../engine/coordinates.js';
import { lookupText, modeForSeed, nextBrowseSeed, ORDERED, pageForSeed } from '../engine/library.js';
import { CoordinateNavigator } from './CoordinateNavigator.jsx';
import { PageViewer } from './PageViewer.jsx';
import { SearchBar } from './SearchBar.jsx';

const START_SEED = nextBrowseSeed(0n, ORDERED);

export function BabelApp({ syncHash = false }) {
  const [seed, setSeed] = useState(START_SEED);
  const [navigationCount, setNavigationCount] = useState(0);
  const [notice, setNotice] = useState({ text: '', error: false });
  const mode = modeForSeed(seed);
  const coordinate = useMemo(() => coordinateForSeed(seed), [seed]);
  const page = useMemo(() => pageForSeed(seed), [seed]);

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
    if (syncHash) {
      const hash = COORDINATE_HASH + formatCoordinate(coordinateForSeed(target));
      if (window.location.hash !== hash) window.history.pushState(null, '', hash);
    }
  }

  function exact(target) {
    navigate(target.seed, target.mode !== mode
      ? 'Exact text found in Universal Raw at line 1, column 1.'
      : 'Exact text found at line 1, column 1.');
  }

  function search(input) {
    try {
      exact(lookupText(input, mode));
      return true;
    } catch (error) {
      status(error.message, true);
      return false;
    }
  }

  return (
    <div className="babel-app">
      <div className="babel-controls">
        <SearchBar
          mode={mode}
          onModeChange={target => {
            if (target !== mode) navigate(nextBrowseSeed(seed, target));
          }}
          onLookup={search}
          onProbe={exact}
        />
        <CoordinateNavigator
          coordinate={coordinate}
          revision={navigationCount}
          onNavigate={navigate}
          onRandom={() => navigate(nextBrowseSeed(seed), 'Random coordinate opened.')}
          onError={message => status(message, true)}
        />
      </div>
      <p className={'babel-status m-0' + (notice.error ? ' babel-error' : '')} role="status">{notice.text}</p>
      <PageViewer key={seed.toString(36)} page={page} coordinate={coordinate} onStatus={status} />
    </div>
  );
}
