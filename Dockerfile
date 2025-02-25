FROM node:lts AS build

USER node
WORKDIR /app

COPY --chown=node package.json package-lock.json ./

RUN npm install

COPY --chown=node . .

RUN npm run build

FROM caddy:2.9.1 AS app

COPY --from=build /app/_site/* /usr/share/caddy/

