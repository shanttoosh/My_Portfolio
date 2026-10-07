#!/usr/bin/env bash
# Animates each storyboard frame into a 5 s 16:9 clip (Kling 2.6 Pro). Stops on the first error.
set -u
C="Pixar-style 3D animated film. Keep the character design, lighting and scene exactly the same as the image. Smooth, natural, cinematic motion. No text appears."
names=(01-intro 02-build 03-projects 04-experience 05-skills 06-assistant 07-contact)
motion=(
  "He types on the laptop while glowing blue particles drift upward from the screen, then he looks up toward the camera with a warm smile. Slow, gentle camera push-in."
  "He studies the board of sticky notes, taps his chin with the marker, then his face lights up with an idea and he nods. Slow camera push-in."
  "He puts both hands in his pockets, glances back over his shoulder at the glowing screens behind him, then turns back to the viewer with a proud, confident smile. The screens gently shimmer in place. The dark left side of the frame stays completely empty. Slow camera push-in."
  "He walks confidently along the glowing path, which brightens beneath his steps as he passes the glowing milestone pillars. The camera tracks smoothly alongside him."
  "The glowing icons and shapes slowly orbit around him while he turns his raised hand and watches them with a curious smile. Slow camera arc around him."
  "The glowing orb pulses gently and its rings rotate while he talks to it, nods and smiles. Slow camera push-in."
  "He smiles warmly and waves hello to the viewer, then lowers his hand and keeps smiling. Slow camera push-in."
)
for i in "${!names[@]}"; do
  n=s${names[$i]}
  [ -f "media/raw/$n.mp4" ] && { echo "skip $n"; continue; }
  echo "== $n"
  npx tsx scripts/higgsfield/clip.ts "media/storyboard/jpg/${names[$i]}.jpg" "$n" "${motion[$i]} $C" 16:9 5 2>&1 | grep -v -i 'secret\|credential' | sed 's#\(Video URL: https://[^/]*\)/.*#\1/...#'
  [ -f "media/raw/$n.mp4" ] || { echo "stopped at $n"; exit 1; }
done
echo "animation done"
