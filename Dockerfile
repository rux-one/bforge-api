FROM node:18

WORKDIR /usr/src/app
# Assumption: project is already built into `dist` 
COPY dist .
COPY package*.json .
COPY node_modules node_modules

CMD ["node", "src/main.js"]