FROM ubuntu:16.04

LABEL maintainer="jkarjala@broadinstitute.org"

RUN apt-get update && \
    apt-get install -y curl python3-pip && \
    curl -sL https://deb.nodesource.com/setup_10.x | bash - && \
    apt-get install -y nodejs && \
    pip3 install gunicorn

ADD . /rna-seq-web

RUN cd /rna-seq-web && \
    pip3 install -r requirements.txt && \
    npm install && \
    node_modules/webpack/bin/webpack.js --config webpack.prod.js

EXPOSE 8000
#CMD cd /rna-seq-web && gunicorn -w 1 --timeout 420 app:app
ENV FLASK_ENV production
CMD cd /rna-seq-web && python3 app.py
