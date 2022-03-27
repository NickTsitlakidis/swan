FROM node:14 As build
WORKDIR /usr/src/app
COPY ["package*.json", "nx.json", "decorate-angular-cli.js", "./"]
RUN npm install
COPY . .
RUN npm run build-api

FROM node:14-alpine As staging
WORKDIR /usr/src/app
COPY ["package*.json", "decorate-angular-cli.js", "./"]
RUN apk add git
RUN npm install --production

FROM node:14-alpine As production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app
COPY ["package*.json", "nx.json", "decorate-angular-cli.js", "./"]
COPY --from=build /usr/src/app/dist ./dist
COPY --from=staging /usr/src/app/node_modules ./node_modules
CMD ["node", "dist/apps/api/main"]
