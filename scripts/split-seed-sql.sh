#!/bin/bash
# Split neon-seed.sql into manageable chunks for Neon SQL Editor
INPUT="neon-seed.sql"
DIR="neon-seed-chunks"
mkdir -p "$DIR"

# Split by table sections
csplit -s -f "$DIR/chunk_" "$INPUT" '/^-- ──/' '{*}'

# Rename and add headers
i=1
for f in "$DIR"/chunk_*; do
  # Skip empty files
  if [ -s "$f" ]; then
    # Get the section name from first comment line
    section=$(head -1 "$f" | sed 's/^-- ── //' | sed 's/ ──$//')
    padded=$(printf "%02d" $i)
    outfile="$DIR/${padded}_${section// /_}.sql"
    
    # Add header
    {
      echo "-- ══════════════════════════════════════════════════"
      echo "-- Part $padded: $section"
      echo "-- Run this in Neon SQL Editor"
      echo "-- ══════════════════════════════════════════════════"
      echo ""
      cat "$f"
    } > "$outfile"
    
    rm "$f"
    count=$(grep -c "^INSERT" "$outfile" 2>/dev/null || echo 0)
    echo "Part $padded: $section ($count INSERTs) → ${outfile##*/}"
    i=$((i+1))
  fi
done
