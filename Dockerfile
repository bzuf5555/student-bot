FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY scripts ./scripts
COPY README.md ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
