#!/bin/bash

set -e

echo "Building VS Code extension..."
pnpm vsix

echo "Installing extension..."
node scripts/install-vsix.js

echo "✓ Installation complete!"
