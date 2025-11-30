#!/bin/bash

echo "Starting Inventory Service..."
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the service
echo "Inventory Service starting on port 3007..."
npm start