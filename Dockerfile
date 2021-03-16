FROM node:12

RUN mkdir -p /usr/GATEWAY
WORKDIR /usr/GATEWAY

COPY package*.json ./
COPY public/ ./

RUN npm install
COPY . .

EXPOSE 3000
CMD ["npm","run", "deploy"]
