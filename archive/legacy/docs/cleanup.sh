#!/bin/bash

# Create to_remove directory if it doesn't exist
mkdir -p to_remove

# List of files that are being actively used in the main website
USED_FILES=(
  "chatbot.js"
  "friendship.js"
  "games.js"
  "interactive-options.js"
  "konami-game.js"
  "particles.js"
  "pong-game.js"
  "snake-game.js"
  "styles.css"
  "friendship.css"
  "game-fixes.css"
  "trivia-quiz.js"
  "index.html"
  "projects.html"
  "certificates.html"
  "package.json"
  "README.md"
)

# Move files that are not in the USED_FILES list and are not directories
for file in $(ls -1 | grep -v "backup\|files\|images\|to_remove"); do
  if [[ ! " ${USED_FILES[@]} " =~ " ${file} " ]] && [[ "$file" != "cleanup.sh" ]]; then
    echo "Moving unused file: $file"
    mv "$file" to_remove/
  fi
done

# Create a list of files in the backup directory
echo "These files are in the backup directory and can probably be removed:"
ls -la backup/ | grep -v "^d" | awk '{print $9}' | grep -v "^$"

echo ""
echo "Files have been moved to the 'to_remove' directory."
echo "Please review these files before permanently deleting them."
echo "To delete the unused files, run: rm -rf to_remove"
echo ""
echo "To move the backup directory to to_remove (after reviewing), run: mv backup to_remove/"

# Create list of files in backup directory
echo "These files are in the backup directory and can probably be removed:"
ls -la backup/ | awk '{print $9}'

echo ""
echo "Files have been moved to the 'to_remove' directory."
echo "Please review these files before permanently deleting them."
echo "To delete these files, run: rm -rf to_remove"
