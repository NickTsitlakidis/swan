FROM node:16.15.1-alpine As build
WORKDIR /usr/src/app
RUN mkdir dist
RUN mkdir dist/apps
COPY dist/apps ./dist/apps
COPY package*.json ./
RUN npm pkg set scripts.postinstall="echo omit-no-postinstall"
RUN npm ci --omit=dev
CMD ["node", "dist/apps/api/main"]
