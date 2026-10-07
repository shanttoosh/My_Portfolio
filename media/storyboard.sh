#!/usr/bin/env bash
# Storyboard: one 16:9 still per section, same character from the reference images. Stops on the first error.
set -u
S='Use the character from the reference images: the same Pixar-style 3D animated young man with wavy black hair, big brown eyes, and a black hoodie with a small white "SV." logo on the chest. Keep his face, hair, proportions and art style exactly the same as the references.'
E='Style: high-end 3D animated feature film still, cinematic lighting, shallow depth of field, rich dark navy and warm amber palette, clean composition, 16:9. The left half of the frame is calm, dark, uncluttered negative space for a headline. No text, no letters, no words, no numbers, no logos anywhere except the small "SV." on the hoodie.'
REFS="media/refs/front.png media/refs/three-quarter.png media/refs/full-body.png"
names=(02-build 03-projects 04-experience 05-skills 06-assistant 07-contact)
scenes=(
  "Scene: a cinematic medium-wide shot in a dark studio. He stands on the right third of the frame in front of a large glass board covered with colorful blank sticky notes joined by hand-drawn arrows and simple diagram shapes, holding a marker, one hand on his chin, thinking. Soft blue light from the board, warm practical lights behind."
  "Scene: he stands on the right third of the frame in front of a curved wall of glowing screens showing abstract app interfaces made of cards, charts and shapes, turning toward the viewer with an open hand presenting them, proud smile. Blue and violet screen glow on his face."
  "Scene: full body, he walks confidently along a glowing path of light on the right third of the frame, through a dark night-time city space, with three softly glowing milestone pillars along the path behind him. Mid-stride, natural walking pose."
  "Scene: he stands on the right third of the frame with one hand raised, surrounded by softly glowing floating 3D icons and geometric shapes (cubes, spheres, gears, network nodes with connecting lines, all abstract) orbiting around him, curious smile, dark studio background."
  "Scene: he sits at his desk on the right third of the frame, turned toward a friendly glowing blue AI orb floating above the desk, chatting with it and smiling. The orb is a smooth sphere of soft light with gentle rings around it, no face. Night studio, warm lamp."
  "Scene: back at his desk in the night studio on the right third of the frame, warm desk lamp on, city lights through the window. He turns toward the viewer, smiles warmly and waves hello with one hand."
)
for i in "${!names[@]}"; do
  n=${names[$i]}
  [ -f "media/storyboard/$n.png" ] && { echo "skip $n"; continue; }
  echo "== $n"
  npx tsx scripts/higgsfield/keyframe.ts "$n" "$S ${scenes[$i]} $E" $REFS 2>&1 | grep -v -i 'secret\|credential'
  [ -f "media/storyboard/$n.png" ] || { echo "stopped at $n"; exit 1; }
done
echo "storyboard done"
