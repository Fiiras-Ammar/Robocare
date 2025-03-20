#!/bin/bash

cd /app

source /app/venv/bin/activate
export PYTHONPATH=/app
echo "----- Collect static files ------ "
python manage.py collectstatic --noinput

echo "-----------Apply migration--------- "
python manage.py makemigrations
python manage.py migrate

echo "-----------Run custom cronjobs --------- "
python manage.py runjob hourly
python manage.py runjob daily

echo "-----------Run gunicorn--------- "
gunicorn -b :8000 satellite_backend.wsgi:application
