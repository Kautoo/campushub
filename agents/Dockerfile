# CampusHub Analyst — Astropods agent image
FROM node:22-alpine
WORKDIR /app
RUN npm install -g tsx@4
COPY agent/index.ts ./agent/index.ts
COPY agent/server.ts ./agent/server.ts

ENV PORT=80
EXPOSE 80
CMD ["tsx", "agent/server.ts"]
