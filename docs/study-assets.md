# Study space: asset brief

The study space uses six of the supplied GLBs: the Japanese arch, wall module, three lamp/garland props, and flowering branches. The two illuminated sign models remain in the source asset set but are intentionally excluded from the scene so the lanterns provide its visual light. The scene scales and positions each model by its world-space bounds.

The supplied garden image fills the view outside the cabin, while the dark plank image is mapped across the floor with repeated texture coordinates. The wall modules, posts, lanterns, chimes, and arch are grouped over that floor to form one centered room. Soft directional shadows ground the geometry, and lantern intensity, background tint, exposure, and ambient lighting follow the day, dusk, and night presets.

Petals, rain, and snow are separate procedural weather modes. Breeze affects the branches, lanterns, chimes, petals, and snow drift; the weather-intensity control changes precipitation speed and opacity.

The garden is fitted to the camera with a cover calculation on resize; the extended floor and background fill wide and fullscreen views. Fullscreen uses the browser API where supported, with an immersive viewport fallback and Escape support. Lanterns pivot from their upper suspension points. Pointer drags play the ceramic-and-brass chimes and add a brief gust to the hanging props.

The soundscape includes recorded rain and fireplace, plus synthesized breeze, stream, ocean wash, brown noise, and pink noise. The former lofi recording control is removed. The composition desk supports eight phrase recipes, an eight-bar arrangement, nine instrument lanes, sixteen steps per bar, chord changes, note-pitch selection, copying and clearing bars, and a blank canvas. Its character voices include classic keys and melody alongside synthesized Rhodes, mellow guitar, and soft sax, with one-click Classic, Jazz, Guitar, Rhodes, and Blue-hour blends. Fresh songs vary chord order, phrase selection, instrumentation, melody, and drum rhythms. **Play from this bar** starts directly at the selected bar; edits during playback move to that bar at the next bar boundary, while the current bar and step stay highlighted. Playback, local save/recall, and WAV export use the same edited arrangement.

Original exports remain untouched in the local `glbfiles/` folder. Run `npm run prepare:models` to regenerate the versioned copies in `src/experiments/study/assets/`. This caps large embedded textures at 1024 px while preserving geometry, materials, transparency, and the GLB axis correction. The complete eight-model source set totals about 16.5 MB, down from 48.6 MB; the page imports and deploys only the six models used by the cabin. Vite gives deployed assets content-hashed URLs. Originals are excluded from Git; only optimized copies ship.

The music studio generates eight-bar phrases locally with seventh-chord progressions, chord-tone melodies, swung sixteenth-note timing, synthesized keys/bass/drums, filtered texture, and echo. Four moods supply starting settings. Layer controls work during playback; new phrases enter on the next bar. Users can save/recall settings on their device and render a WAV download. This is an algorithmic music instrument, not a trained music-generation model. The existing Proibe loops remain available separately.

For the intricate courtyard/temple direction in the reference, the next visual pass would benefit from:

| Asset | Preferred delivery | Purpose |
| --- | --- | --- |
| Main courtyard or pavilion | One `.glb`, real-world meter scale, ideally 10–25 MB or less | Architecture, roof details, stone, wood, and layout |
| Trees and foliage | Separate `.glb` objects or objects named inside the scene | Gentle motion without deforming the building |
| Material textures | Embedded in GLB or a clearly named texture folder; 1K/2K maps | Base color, roughness, normal maps, optional ambient occlusion |
| Chime samples | 4–6 clean, isolated `.wav` recordings, with their full decay | More realistic strikes; synthesized notes work already |
| Background ambience | Loopable `.mp3`/`.ogg` files, 1–3 minutes | Wind, water, birds, or alternate lofi tracks |
| Lighting reference | One screenshot or mood reference per desired preset | Match afternoon, dusk, and night consistently |

The single highest-impact asset is the **main environment GLB**. It can come from a model you make, a commissioned artist, or a downloaded asset with permission to include it in a public portfolio. No animation, rig, or complex physics is required. Separate named objects such as `chime_01`, `lantern_01`, and `tree_01` make interaction easier.

Keep detailed architecture in one environment model and interactive props as separate objects. The existing controls call `setMood`, `strike`, and the audio mixer independently, so replacing the visual scene does not require rebuilding the study tools.

The imported props and supplied images now form a complete stylized cabin terrace rather than a blank procedural backdrop.
