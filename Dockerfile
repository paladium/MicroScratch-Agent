FROM node:lts-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
COPY .env.production.yml .env.yml
RUN npm run build

FROM node:lts-alpine
WORKDIR /app
COPY --from=build-stage /app/build .
CMD ["node", "bundle.js"]
