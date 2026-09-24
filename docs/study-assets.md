# Study space: asset brief

The study space now uses all eight supplied GLBs: the Japanese arch, wall module, two signs, three lamp/garland props, and flowering branches. The scene scales and positions each model by its world-space bounds. Wind animates the lanterns and branches; falling petals, rain, lighting presets, and playable chimes remain procedural.

Original exports remain untouched in the local `glbfiles/` folder. Run `npm run prepare:models` to regenerate the versioned runtime copies in `src/experiments/study/assets/`. This caps large embedded textures at 1024 px while preserving geometry, materials, transparency, and the GLB axis correction. The eight runtime files total about 16.5 MB, down from 48.6 MB. Vite gives the deployed copies content-hashed URLs. Originals are excluded from Git; only optimized copies ship.

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

The imported props form a stylized terrace. A complete authored landscape and higher-detail architecture would support a future pass toward the reference-quality temple scene.
