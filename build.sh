#!/bin/bash

# Navigate to client directory and build
cd Client
npm ci
npm run build

# Copy built files to the correct location for Vercel
cp -r dist/* ../dist/ 2>/dev/null || :