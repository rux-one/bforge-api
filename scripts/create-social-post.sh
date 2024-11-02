#!/bin/sh
curl -XPOST http://localhost:3000/content/social-posts \
    -H "Content-Type: application/json" \
    -d '{
        "name": "My test social post",
        "content": "This is my first social post",
        "imageUrl": "https://example.com/image.jpg"
    }'

