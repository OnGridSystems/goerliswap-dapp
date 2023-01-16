FROM node:14.21-buster-slim as build-app
RUN apt-get update && apt-get install -y git
ARG REACT_APP_FORTMATIC_KEY
ARG REACT_APP_INFURA_KEY
ARG REACT_APP_PORTIS_ID
WORKDIR /goerliswap-dapp
ENV PATH /goerliswap-dapp/node_modules/.bin:$PATH
COPY . ./
RUN yarn
RUN yarn build

FROM nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-app /goerliswap-dapp/build /usr/share/nginx/html
EXPOSE 80