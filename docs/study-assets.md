# Study space: asset brief

The first study-space prototype is fully functional without new assets. It uses procedural geometry, synthesized chimes, and three existing Proibe loops (lofi, rain forest, campfire).

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

The current chimes and terrace are a first exploration, not a reproduction of the reference-quality temple scene.
