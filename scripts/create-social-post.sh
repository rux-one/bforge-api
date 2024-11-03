#!/bin/sh
ZULU_NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

clear && curl -XPOST http://localhost:3000/content/social-posts \
    -H "Content-Type: application/json" \
    -d '{
        "name": "My earlier test social post",
        "content": "This is my first social post",
        "imageUrl": "https://example.com/image.jpg",
        "weight": 0,
        "validFrom" : "'"$ZULU_NOW"'"
    }' | jq