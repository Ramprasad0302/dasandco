DAS & CO — FRONTEND, BACKEND, AND DATABASE

This zip has three parts.

frontend/
  Upload this folder to Hostinger for dasandco.online.
  Build command: npm install && npm run build
  Start command: npm start
  The site signs in through https://backenddasandco.vercel.app/api

backend/
  Upload this folder to the Vercel project backenddasandco.
  Framework preset: Other. Do not set an output directory.
  Environment variables:
    DB_HOST       Hostinger remote MySQL hostname (not localhost)
    DB_PORT       3306
    DB_NAME       database name from hPanel
    DB_USER       database user from hPanel
    DB_PASSWORD   database password from hPanel
    JWT_SECRET    a long random string
    JWT_EXPIRES_IN 7d
  In hPanel → Databases → Remote MySQL, allow access from any host.
  After deploy, https://backenddasandco.vercel.app/api/health
  must return "API is running".

database/das-and-co.sql
  Import this in Hostinger → phpMyAdmin.
  It loads the 1 October 2026 clients, orders, expenses, gold vault, and settings.
  Existing login accounts are kept.
  If sandeepdas6699@gmail.com is not already in the database, the import creates it.
  Password for that new account: Dasandco@2026

The login error "Unable to connect to backend" happens when the Vercel API
crashes on startup. This backend no longer uses the native bcrypt module, so
the API can start. Deploy the backend folder, then the frontend folder.
