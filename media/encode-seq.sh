#!/usr/bin/env bash
# Turns each 16:9 scene into a WebP frame sequence for canvas scrubbing, packed into one streamable file per
# scene and width: public/video/seq/<scene>-<width>.bin (frames are kept in media/seq-frames/ for inspection).
# A frame sequence shows any frame instantly, at any scroll speed and in either direction, where seeking a video
# has to decode from a keyframe and falls behind on modest hardware.
set -eu
FF=node_modules/ffmpeg-static/ffmpeg.exe
out=public/video/seq
frames=media/seq-frames
rm -rf "$out" "$frames"; mkdir -p "$out" "$frames"
for src in media/raw/s0*.mp4; do
  n=$(basename "$src" .mp4); n=${n#s}
  for w in 1280 1920; do
    h=$((w * 9 / 16)); q=$([ "$w" = 1280 ] && echo 72 || echo 70)
    mkdir -p "$frames/$n/$w"
    "$FF" -hide_banner -loglevel error -i "$src" -vf "scale=${w}:${h}:flags=lanczos" -c:v libwebp -quality "$q" -compression_level 4 "$frames/$n/$w/f%03d.webp"
    node scripts/pack-frames.mjs "$frames/$n/$w" "$out/$n-$w.bin" > /dev/null
  done
  mkdir -p public/video/scenes
  "$FF" -hide_banner -loglevel error -y -i "$src" -frames:v 1 -vf "scale=1920:1080:flags=lanczos" -quality 80 "public/video/scenes/$n-poster.webp"
  count=$(ls "$frames/$n/1280" | wc -l)
  printf '%-14s %3s frames  1280: %5s KB  1920: %5s KB\n' "$n" "$count" $(( $(stat -c %s "$out/$n-1280.bin") / 1024 )) $(( $(stat -c %s "$out/$n-1920.bin") / 1024 ))
done
