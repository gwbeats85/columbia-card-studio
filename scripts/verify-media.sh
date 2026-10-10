#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
FFMPEG_BIN=$(command -v ffmpeg || true)
FFPROBE_BIN=$(command -v ffprobe || true)
: "${FFMPEG_BIN:=/opt/homebrew/bin/ffmpeg}"
: "${FFPROBE_BIN:=/opt/homebrew/bin/ffprobe}"
"$FFPROBE_BIN" -v error -count_frames -show_entries stream=codec_name,width,height,r_frame_rate,nb_read_frames,duration -show_entries format=format_name,duration,size -of json proofs/pull-studio-hero-reveal.mp4 > proofs/ffprobe.json
"$FFMPEG_BIN" -v error -i proofs/pull-studio-hero-reveal.mp4 -f null -
"$FFMPEG_BIN" -hide_banner -i proofs/pull-studio-hero-reveal.mp4 -vf 'blackdetect=d=0.1:pix_th=0.02,freezedetect=n=-50dB:d=0.6' -an -f null - 2> proofs/frame-analysis.log
"$FFMPEG_BIN" -v error -y -i proofs/pull-studio-hero-reveal.mp4 -vf 'fps=1,scale=270:480,tile=4x2' -frames:v 1 proofs/contact-sheet.jpg
"$FFMPEG_BIN" -v error -y -ss 7 -i proofs/pull-studio-hero-reveal.mp4 -frames:v 1 proofs/export-7s.png
"$FFMPEG_BIN" -hide_banner -i proofs/reference-7s.png -i proofs/export-7s.png -lavfi ssim -f null - 2> proofs/ssim.log
cat proofs/ffprobe.json
