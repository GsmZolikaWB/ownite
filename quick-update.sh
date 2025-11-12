#!/bin/bash
# Quick update script - for development changes only (no dependency changes)

echo "⚡ Quick update (no dependency install)..."

git pull origin $(git branch --show-current)
npm run build

if command -v pm2 &> /dev/null; then
    pm2 restart mechatronics-portfolio
elif systemctl is-active --quiet mechatronics-portfolio; then
    sudo systemctl restart mechatronics-portfolio
else
    echo "⚠️  Please restart manually: npm start"
fi

echo "✅ Quick update complete!"
