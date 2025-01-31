#!/bin/sh
clear && curl -XPUT http://localhost:3000/hedgedoc/foo123 \
    -H "Content-Type: application/json" \
    -d '{
        "content": "New note content",
        "append": false
    }' | jq