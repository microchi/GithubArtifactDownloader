FROM alpine:latest

ENV GAD_Owner=YourOwner
ENV GAD_Repo=YourRepository
ENV GAD_Token=YourToken
ENV GAD_Runonce=false

EXPOSE 3000

WORKDIR /root

COPY GAD .

RUN apk update && apk add --no-cache libstdc++ libgcc

RUN mkdir /root/dist

VOLUME /root/dist

CMD ["./GAD"]