---
description: Deploy Backend and Database to Railway
---

# Deploying Sittha Viruthi Backend to Railway

This guide outlines the steps to deploy your Java Spring Boot backend and MySQL database to Railway.

## Prerequisites
- A [Railway](https://railway.app/) account.
- [GitHub CLI](https://cli.github.com/) or Git installed and authenticated.
- [Railway CLI](https://docs.railway.app/guides/cli) installed (optional but recommended).

## Step 1: Prepare the Project
(Done!) The project already contains a `Dockerfile` and updated `application.properties` optimized for Railway.

## Step 2: Create a New Project on Railway
1.  Log in to the [Railway Dashboard](https://railway.app/dashboard).
2.  Click **"New Project"**.
3.  Select **"Deploy from GitHub repo"**.
4.  Select your repository (`sittha-main` or equivalent).
5.  **Important:** Since this is a monorepo (frontend + backend), you must configure the **Root Directory**.
    *   Click on the project Settings -> **General**.
    *   Scroll to **Root Directory** and set it to `/backend`.
    *   Railway will now look for the `Dockerfile` inside the `backend` folder.

## Step 3: Add a MySQL Database
1.  In your Railway project view, click **"New"** (or Right Click -> "Add Service").
2.  Select **"Database"** -> **"MySQL"**.
3.  Wait for the MySQL service to initialize.

## Step 4: Configure Environment Variables
1.  Click on the **MySQL Service** card.
2.  Go to the **Connect** tab.
3.  Copy the connection variables (HOST, USER, PASSWORD, PORT, DATABASE).
    *   *Tip: Railway often provides a single `DATABASE_URL` as well.*

4.  Click on your **Backend Service** (Spring Boot) card.
5.  Go to the **Variables** tab.
6.  Add the following variables:

    | Variable Key | Value (from MySQL Service) |
    | :--- | :--- |
    | `PORT` | `8080` (Railway sets this automatically, but good to double check) |
    | `DB_URL` | `jdbc:mysql://${MYSQLHOST}:${MYSQLPORT}/${MYSQLDATABASE}` |
    | `DB_USERNAME` | `${MYSQLUSER}` |
    | `DB_PASSWORD` | `${MYSQLPASSWORD}` |
    | `JWT_SECRET` | (Generate a strong random string) |
    | `MAIL_USERNAME` | (Your Gmail address) |
    | `MAIL_PASSWORD` | (Your App Password) |

    *Note: Railway allows referencing variables from other services using `${Variable}` syntax.*

## Step 5: Deploy
1.  Once variables are saved, Railway might auto-deploy. If not, click **"Deploy"**.
2.  Monitor the **Deploy Logs**.
    *   You should see Maven downloading dependencies (`mvn clean package`).
    *   Then the app starting (`Started AttendanceApplication in ... seconds`).

## Step 6: Verify
1.  Go to the **Settings** tab of your Backend Service.
2.  Under **Networking**, click **"Generate Domain"** to get a public URL (e.g., `web-production-1234.up.railway.app`).
3.  Open that URL + `/health` or `/swagger-ui.html` to verify the backend is running.

## Troubleshooting
- **"Connection Refused"**: Check `DB_URL` format. It must start with `jdbc:mysql://`.
- **"Build Failed"**: Check the build logs. Ensure the path is set to `/backend`.
- **"Memory Error"**: Java apps can be memory hungry. Consider increasing the RAM limit in Railway settings if the build crashes (OOM).
