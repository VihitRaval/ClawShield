FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Ensure directories exist
RUN mkdir -p logs database config

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
