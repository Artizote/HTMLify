# Ruby Dockerfile

FROM ruby:3.0-alpine

WORKDIR /root

COPY file /root/main.rb

CMD ["ruby", "main.rb"]
