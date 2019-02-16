FROM mhart/alpine-node:11

COPY src/package.json src/package.json
WORKDIR src
RUN npm install
COPY src .

