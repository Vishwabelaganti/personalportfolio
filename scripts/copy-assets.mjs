import { mkdir, copyFile, writeFile } from 'node:fs/promises';
await mkdir('dist/files', { recursive: true });
await copyFile('files/Vishwa_Belaganti_Resume 2026.pdf', 'dist/files/Vishwa_Belaganti_Resume 2026.pdf');
await writeFile('dist/.nojekyll', '');
