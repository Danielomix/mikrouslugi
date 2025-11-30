#!/bin/bash

echo "Starting Analytics Service..."
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the service
echo "Analytics Service starting on port 3008..."
npm start