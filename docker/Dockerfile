# Based on https://raw.githubusercontent.com/ebidel/try-puppeteer/master/backend/Dockerfile

FROM node:8-slim

LABEL maintainer="Michael Stillwell <mjs@beebo.org>"

ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.1/dumb-init_1.2.1_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init
ENTRYPOINT ["dumb-init", "--"]

RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
    apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y google-chrome-unstable --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

RUN groupadd -r luser && \
    useradd -r -g luser -G audio,video luser && \
    mkdir -p /home/luser/Downloads && \
    chown -R luser:luser /home/luser && \
    mkdir -p /app && \
    chown -R luser:luser /app && \
    mkdir -p /app/share && \
    chown -R luser:luser /app/share
USER luser

COPY . /app/
WORKDIR app
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
RUN yarn && yarn cache clean

CMD ["yarn", "run", "-s", "start"]
