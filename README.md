# Product Management System — MySQL Version

A full-stack product management and sales application built with HTML, CSS, vanilla JavaScript, Node.js, Express, and MySQL. This version replaces browser-based localStorage persistence with a relational database accessed through a backend REST API.

## Features

- **Authentication:** User registration, login, and logout.
- **Product CRUD:** Create, retrieve, update, and delete products.
- **Inventory management:** Track product quantities in MySQL.
- **Sales management:** Search for products, calculate sales, and update stock quantities in the database.
- **Discount calculations:** Manage discounts and product totals.
- **Database persistence:** Store products and user records in MySQL.
- **Protected API:** Require authentication for protected product endpoints.
- **Database permissions:** Use a dedicated MySQL application account with restricted privileges.

## Tech Stack

**Frontend:** HTML5, CSS3, Vanilla JavaScript  
**Backend:** Node.js, Express.js, REST API  
**Database:** MySQL  
**Other tools:** npm, Git, GitHub, VS Code, MySQL Workbench, Live Server

## Architecture

- Frontend: `http://localhost:5500` (Live Server)
- Backend: `http://localhost:3000`
- Database: MySQL, database name `gestion_produits`

The frontend sends HTTP requests to the Express API. The backend validates requests and interacts with MySQL using parameterized SQL queries.

## Prerequisites

- Node.js and npm
- MySQL Server
- MySQL Workbench (recommended)
- Visual Studio Code and Live Server

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/QATester22-25/CRUD-Management-System.git
cd "CRUD Operations Project"
```

### 2. Configure MySQL

Create the database:

```sql
CREATE DATABASE gestion_produits;
```

Create the `products` and `users` tables using the schema required by the SQL queries in `backend/server.js`. Ensure that the email is unique if the application uses it to identify accounts.


### 3. Configure environment variables

Create `backend/.env` using the variable names expected by `backend/db.js` and `backend/server.js`. A typical configuration is:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=gestion_app
DB_PASSWORD=your_database_password
DB_NAME=gestion_produits
```

Replace the example password with your own. Never commit `.env` or publish database credentials.

### 4. Install backend dependencies

```bash
cd backend
npm install
```

### 5. Start the backend

```bash
node server.js
```

The API should be available at `http://localhost:3000`.

### 6. Start the frontend

Open the frontend folder in VS Code and launch `index.html` using Live Server at `http://localhost:5500`.

Make sure the frontend API URL and backend CORS configuration match your local setup.

## Security Notes

- Database credentials are stored in an environment file excluded from Git.
- The application uses a dedicated MySQL account instead of the root account.
- The application account has CRUD permissions on `products` and `SELECT`/`INSERT` permissions on `users`, according to the configured database grants.
- Protected API endpoints require authentication.
- Never expose password hashes, database credentials, or session secrets to the frontend.

## What I Learned

- Integrating a vanilla JavaScript frontend with a REST API.
- Building backend routes with Node.js and Express.
- Using MySQL for persistent relational data storage.
- Implementing registration, login, and logout flows.
- Applying database permissions according to the principle of least privilege.
- Maintaining separate Git branches for an initial implementation and a database-backed migration.

## Author

**HEDI NAILI**
