#!/usr/bin/env bash
# Converte os webm gravados por capture-video.js nos mp4 da documentacao:
# corta a espera do inicio da gravacao e queima a legenda do cenario.
#
# Uso: scripts/media/render.sh [diretorio-dos-webm] [diretorio-de-saida]
# Requer um ffmpeg com libx264 e libass (o build estatico do site johnvansickle serve).
set -euo pipefail

FFMPEG=${FFMPEG:-ffmpeg}
FFPROBE=${FFPROBE:-ffprobe}
IN=${1:-/tmp/videos}
OUT=${2:-assets/media}
CAPTIONS="$(dirname "$0")/captions"

render() {  # nome, inicio do corte, duracao
  local nome=$1 inicio=$2 duracao=$3
  "$FFMPEG" -y -v error -ss "$inicio" -t "$duracao" -i "$IN/$nome.webm" \
    -vf "subtitles=$CAPTIONS/$nome.ass" \
    -c:v libx264 -preset medium -crf 23 -pix_fmt yuv420p -movflags +faststart -an "$OUT/$nome.mp4"
  printf '%-18s %ss\n' "$nome.mp4" "$("$FFPROBE" -v error -show_entries format=duration -of default=nw=1:nk=1 "$OUT/$nome.mp4")"
}

mkdir -p "$OUT"
render live-alert  48 38
render replay-pcap 62 40
render hids-auth   39 30
