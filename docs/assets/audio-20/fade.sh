#!/bin/bash
for name in *.mp3; do
	ffmpeg -i "$name" -af afade=t=out:st=19.75:d=0.25 -q:a 5 "../audio-20-fade/${name%.*}.mp3"
	# ffmpeg -t 20 -i "$name" -acodec copy 
done 