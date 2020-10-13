
FROM node:latest AS build
WORKDIR /app

COPY package.json .
COPY GAD.js .
RUN yarn
RUN yarn install
RUN yarn build

FROM alpine:latest
ENV GAD_Owner=YourOwner
ENV GAD_Repo=YourRepository
ENV GAD_Token=YourToken
ENV GAD_Runonce=false

EXPOSE 3000

WORKDIR /root

RUN mkdir /root/dist

VOLUME /root/dist

RUN apk update && apk add --no-cache libstdc++ libgcc

COPY --from=build /app/GAD /root/GAD

CMD ["./GAD"]