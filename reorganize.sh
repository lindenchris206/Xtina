#!/usr/bin/env bash
set -euo pipefail

SRC="drive_root"
DST="AI_Crew_Commander_repo"

# Directories
PROJECTS="$DST/projects"
SHARED="$DST/shared/src"
DOCS="$DST/docs"
ASSETS_IMAGES="$DST/assets/images"
ASSETS_VIDS="$DST/assets/videos"
ASSETS_LARGE="$DST/assets/large_binaries"
SCRIPTS="$DST/scripts"
FLAGS="$DOCS/flags"

mkdir -p "$PROJECTS" "$SHARED" "$DOCS" "$ASSETS_IMAGES" "$ASSETS_VIDS" "$ASSETS_LARGE" "$SCRIPTS" "$FLAGS"

MANIFEST="$DST/move_manifest.csv"
echo "orig_path,orig_size_bytes,orig_mtime_iso,new_path,notes" > "$MANIFEST"

# helper to record moves
record() {
  orig="$1"; new="$2"; note="${3:-}"
  if [ -e "$orig" ]; then
    size=$(stat -c%s "$orig" 2>/dev/null || stat -f%z "$orig")
    mtime=$(date -Iseconds -r "$orig" 2>/dev/null || date -r "$orig" +"%Y-%m-%dT%H:%M:%S%:z")
  else
    size=0; mtime=""
  fi
  echo "\"$orig\",$size,\"$mtime\",\"$new\",\"$note\"" >> "$MANIFEST"
}

# Move a folder if it exists
move_folder() {
  src="$1"; dest="$2"; note="${3:-}"
  if [ -d "$SRC/$src" ]; then
    mkdir -p "$dest"
    echo "Moving $SRC/$src -> $dest/"
    # Use rsync to preserve timestamps/permissions where available
    rsync -a --remove-source-files "$SRC/$src/" "$dest/" >/dev/null
    # remove empty dir
    find "$SRC/$src" -type d -empty -delete || true
    record "$SRC/$src" "$dest" "$note"
  else
    echo "No folder $SRC/$src (skipping)"
  fi
}

# Map Drive folders to projects
move_folder "Christina" "$PROJECTS/christina" "Christina mini-project (10 files)"
move_folder "ai-crew-22-main" "$PROJECTS/ai-crew-22" "ai-crew-22"
move_folder "ai-crew-main" "$PROJECTS/ai-crew" "ai-crew"
move_folder "AI-Crew-Commander-main" "$PROJECTS/AI-Crew-Commander" "AI-Crew-Commander"
move_folder "astra-nexus" "$PROJECTS/astra-nexus" "astra-nexus"
move_folder "astra-nexus-main" "$PROJECTS/astra-nexus-legacy" "astra-nexus-main (legacy)"

# Move shared files
for f in "Browser.tsx" "FileConverter.tsx" "fileTypes.js" "code_generation.py"; do
  if [ -e "$SRC/$f" ]; then
    mkdir -p "$SHARED"
    mv -n "$SRC/$f" "$SHARED/"
    record "$SRC/$f" "$SHARED/$f" "shared"
  fi
done

# Move docs
for f in "AI Crew Commander Suite - Project Master Plan.pdf" "DELIVERY_SUMMARY.md" "20_IMPROVEMENTS.md" \
         "best practices for large react modular software design.odt" "Code and file review.html" "code and review.txt"; do
  if [ -e "$SRC/$f" ]; then
    cp -a "$SRC/$f" "$DOCS/"
    record "$SRC/$f" "$DOCS/$f" "docs"
  fi
done

# Move archives: try to place near matching project; otherwise docs/attachments
mkdir -p "$DOCS/attachments"
for z in "$SRC"/*.zip "$SRC"/*.ZIP; do
  [ -e "$z" ] || continue
  base=$(basename "$z")
  if [[ "$base" =~ ai-crew-22 ]]; then target="$PROJECTS/ai-crew-22/archives"
  elif [[ "$base" =~ ai-crew-main|ai-crew ]]; then target="$PROJECTS/ai-crew/archives"
  elif [[ "$base" =~ AI-Crew-Commander ]]; then target="$PROJECTS/AI-Crew-Commander/archives"
  elif [[ "$base" =~ astra-nexus ]]; then target="$PROJECTS/astra-nexus-legacy/archives"
  else target="$DOCS/attachments"
  fi
  mkdir -p "$target"
  mv -n "$z" "$target/"
  record "$z" "$target/$base" "archive"
  # Flag suspiciously tiny zip
  size=$(stat -c%s "$target/$base" 2>/dev/null || stat -f%z "$target/$base")
  if [ "$size" -lt 2000 ]; then
    echo "Flag: $target/$base is suspiciously small ($size bytes)" >> "$FLAGS/suspicious_archives.txt"
  fi
done

# Move images/videos: heuristics by extension
find "$SRC" -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" -o -iname "*.avif" -o -iname "*.webp" \) -print0 | while IFS= read -r -d '' img; do
  b=$(basename "$img")
  # large ones
  size=$(stat -c%s "$img" 2>/dev/null || stat -f%z "$img")
  if [ "$size" -gt $((50*1024*1024)) ]; then
    mv -n "$img" "$ASSETS_LARGE/"
    record "$img" "$ASSETS_LARGE/$b" "large_media"
    echo "$b,$size" >> "$DOCS/flags/large_media.csv"
  else
    mv -n "$img" "$ASSETS_IMAGES/"
    record "$img" "$ASSETS_IMAGES/$b" "image"
  fi
done

find "$SRC" -maxdepth 1 -type f \( -iname "*.mp4" -o -iname "*.mov" -o -iname "*.webm" \) -print0 | while IFS= read -r -d '' vid; do
  b=$(basename "$vid")
  size=$(stat -c%s "$vid" 2>/dev/null || stat -f%z "$vid")
  if [ "$size" -gt $((50*1024*1024)) ]; then
    mv -n "$vid" "$ASSETS_LARGE/"
    record "$vid" "$ASSETS_LARGE/$b" "large_video"
    echo "$b,$size" >> "$DOCS/flags/large_media.csv"
  else
    mv -n "$vid" "$ASSETS_VIDS/"
    record "$vid" "$ASSETS_VIDS/$b" "video"
  fi
done

# Move misc HTML/other small files
for f in "ai crew _ Claude.html" "ai crew _ Claude.html"; do
  if [ -e "$SRC/$f" ]; then
    mv -n "$SRC/$f" "$DOCS/"
    record "$SRC/$f" "$DOCS/$f" "misc"
  fi
done

# create per-project README templates (simple)
for p in "$PROJECTS"/*; do
  [ -d "$p" ] || continue
  name=$(basename "$p")
  readme="$p/README.md"
  if [ ! -e "$readme" ]; then
    cat > "$readme" <<EOF
# $name

Short description: TODO.

Quick start:
- install deps: TODO
- run demo: TODO

Notes:
- Files moved from Drive. See ../move_manifest.csv for original locations.
EOF
    echo "Created README for $name"
  fi
done

# Top-level README
cat > "$DST/README.md" <<EOF
AI Crew Commander Suite (reorganized)

Projects:
$(for d in "$PROJECTS"/*; do echo "- $(basename "$d")"; done)

Docs: see docs/
Assets (large files): assets/large_binaries/
Manifest: move_manifest.csv
EOF

echo "Reorganization script complete. Manifest at $MANIFEST"