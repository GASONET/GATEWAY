FROM node:12

RUN mkdir -p /usr/gracialab-api-gateway
WORKDIR /usr/gracialab-api-gateway

COPY package*.json ./
COPY public/ ./

RUN npm install
COPY . .

EXPOSE 3000
CMD ["npm","run", "deploy"]