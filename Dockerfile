FROM oven/bun:1.0-slim
WORKDIR /app
# Install dependencies first for caching
COPY package.json bun.lock ./
RUN bun i
# Copy application files
COPY . .
# Expose internal port
EXPOSE 8000
# Start command
CMD ["bun", "run", "--port", "8000", "index.ts"]