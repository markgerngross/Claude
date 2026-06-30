#!/usr/bin/env bash
# Laedt die echten Video-Demos vom Higgsfield-CDN herunter und speichert sie
# lokal, damit die App sie vom eigenen Server ausliefert (echtes Self-Hosting,
# offline-faehig). Auf dem eigenen Server/Rechner ausfuehren – dort gibt es
# keine Egress-Sperre.
#
#   bash scripts/fetch-videos.sh
#
# Danach in public/figure.js die MOVE_VIDEO-Eintraege auf die lokalen Pfade
# (videos/<name>.mp4) umstellen und public/ -> docs/ neu kopieren.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p public/videos

declare -A VIDS=(
  [wolkenhaende]="https://d8j0ntlcm91z4.cloudfront.net/user_2wdygT3KA6xz6tIdT2x1QLr2URr/hf_20260630_090207_50f7b54e-ea96-4345-b406-c12caba3900e.mp4"
  [atem]="https://d8j0ntlcm91z4.cloudfront.net/user_2wdygT3KA6xz6tIdT2x1QLr2URr/hf_20260630_090245_47a862e7-1f1c-4b85-896f-328869fac5d8.mp4"
)

for name in "${!VIDS[@]}"; do
  url="${VIDS[$name]}"
  echo "Lade $name ..."
  curl -fL --retry 3 -o "public/videos/$name.mp4" "$url"
done

echo "Fertig. Dateien liegen in public/videos/."
echo "Jetzt in public/figure.js MOVE_VIDEO auf 'videos/<name>.mp4' setzen"
echo "und 'cp public/videos/*.mp4 docs/videos/' ausfuehren."
