import React from 'react';
import { createRoot } from 'react-dom/client';
import { BabelApp } from './ui/BabelApp.jsx';
import './tailwind.css';
import './style.css';

createRoot(document.getElementById('babel-root')).render(<BabelApp syncHash />);
