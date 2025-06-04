FROM python:3.11-slim

WORKDIR /app

RUN pip install uv

COPY pyproject.toml uv.lock ./

RUN uv sync --frozen

COPY . .

RUN mkdir -p logs

EXPOSE 8000

ENV ENVIRONMENT=prod

CMD ["uv", "run", "python", "-m", "app.main"]
