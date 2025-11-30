#!/bin/bash

echo "Starting Payment Service..."
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the service
echo "Payment Service starting on port 3005..."
npm start