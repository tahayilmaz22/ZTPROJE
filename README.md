# Müşteri / Hesap / İşyeri / Terminal Yönetim Sistemi

A full-stack management system for customers, accounts, workplaces, and terminals — built with **React**, **Node.js/Express**, and **MySQL**.

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup — All Platforms](#setup--all-platforms)
  - [1. Clone & Install](#1-clone--install)
  - [2. Database Setup](#2-database-setup)
  - [3. Environment Configuration](#3-environment-configuration)
  - [4. Start the Application](#4-start-the-application)
- [Platform-Specific Notes](#platform-specific-notes)
  - [Windows](#windows)
  - [macOS](#macos)
  - [Linux](#linux)
- [API Reference](#api-reference)
- [Screenshots](#screenshots)
- [Security Notes](#security-notes)

---

## Features

| Module | Capabilities |
|---|---|
| **Customer Management** | Two customer types — Individual (Gerçek) & Corporate (Tüzel). Dynamic forms with type-specific fields. TC Kimlik No algorithmic validation (Turkish ID). Input masking for phone & TC Kimlik. |
| **Account Management** | Multiple accounts per customer. Currency support (TRY, USD, EUR, GBP). IBAN format validation (mod 97 check). Balance & blocked amount tracking. |
| **Workplace Management** | Multiple workplaces per customer. Normal/Virtual types. Commission rate & block day tracking. |
| **Terminal Management** | Multiple terminals per workplace. Status tracking (Open/Closed/Awaiting Setup). Dynamic closure reason rule (required when status = Closed, hidden otherwise). |
| **Global Search** | Search across customers, workplaces, and terminals from any page — by customer no, name, workplace name, or terminal serial no. |
| **Operation Logging** | Audit trail for every workplace/terminal status change — who changed it, when, old → new values. |
| **Dashboard** | Live widgets: open terminal count, total blocked amount, today's new customers, total customers/terminals/workplaces. |
| **Excel Export** | Download customer and terminal lists as `.xlsx` files. |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, React Router 7, Vite 8 |
| **Backend** | Node.js, Express 4 |
| **Database** | MySQL 8+ |
| **Libraries** | mysql2 (DB driver), ExcelJS (export), cors, dotenv |

---

## Project Structure

```
stajproje/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express server entry point
│   │   ├── config/
│   │   │   └── db.js             # MySQL connection pool
│   │   ├── routes/
│   │   │   ├── customers.js      # Customer CRUD + type-specific logic
│   │   │   ├── accounts.js       # Account CRUD
│   │   │   ├── workplaces.js     # Workplace CRUD + status logging
│   │   │   ├── terminals.js      # Terminal CRUD + closure reason rule
│   │   │   ├── search.js         # Global search endpoint
│   │   │   ├── logs.js           # Operation history
│   │   │   ├── dashboard.js      # Dashboard statistics
│   │   │   └── exportRoutes.js   # Excel export (ExcelJS)
│   │   ├── middleware/
│   │   │   └── errorHandler.js   # Centralized error handling
│   │   ├── utils/
│   │   │   ├── tcKimlikValidator.js  # Turkish ID algorithm
│   │   │   ├── ibanValidator.js      # IBAN mod 97 check
│   │   │   └── validators.js         # Request validation
│   │   └── db/
│   │       └── schema.sql        # Full database schema
│   ├── .env.example              # Environment template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── main.jsx              # React entry point
│   │   ├── App.jsx               # Router + layout
│   │   ├── App.css               # Global styles
│   │   ├── services/
│   │   │   └── api.js            # API client
│   │   ├── context/
│   │   │   └── AppContext.jsx    # Global state (toast, search)
│   │   ├── utils/
│   │   │   └── masks.js          # TC Kimlik & phone input masks
│   │   ├── components/
│   │   │   ├── Layout/           # App shell (sidebar + header)
│   │   │   ├── Sidebar/          # Navigation menu
│   │   │   ├── GlobalSearch/     # Debounced global search bar
│   │   │   ├── Breadcrumb/       # Breadcrumb navigation
│   │   │   └── Modal/            # Reusable modal dialog
│   │   └── pages/
│   │       ├── Dashboard/        # Stat widgets + quick actions
│   │       ├── Customers/        # List, Detail, Form (individual/corporate)
│   │       ├── Accounts/         # List, Form
│   │       ├── Workplaces/       # List, Form
│   │       ├── Terminals/        # List, Form (closure reason rule)
│   │       └── Logs/             # Paginated operation history
│   ├── vite.config.js            # Dev server + API proxy
│   └── package.json
├── specifications.txt            # Original requirements document (Turkish)
├── .gitignore
└── README.md
```

---

## Prerequisites

| Software | Minimum Version | Required For |
|---|---|---|
| **Node.js** | 18.x or later | Backend + Frontend runtime |
| **npm** | 9.x or later (ships with Node.js) | Package management |
| **MySQL** | 8.0 or later | Database |

---

## Setup — All Platforms

### 1. Clone & Install

```bash
# Clone the repository
git clone <repo-url>
cd stajproje

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

1. Start your MySQL server.
2. Log into MySQL and create the database:

```sql
CREATE DATABASE stajproje CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Import the schema:

```bash
mysql -u root -p stajproje < backend/src/db/schema.sql
```

This creates all 7 tables with proper foreign keys, constraints, and indexes.

### 3. Environment Configuration

1. Copy the environment template in the `backend/` directory:

```bash
cd backend
cp .env.example .env
```

2. Edit `backend/.env` with your MySQL credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=stajproje
DB_USER=root
DB_PASSWORD=your_mysql_password_here
PORT=5000
```

> ⚠️ **Security**: `.env` is in `.gitignore` and will never be committed. Never commit real credentials.

### 4. Start the Application

Open **two terminals**:

**Terminal 1 — Backend** (port 5000):
```bash
cd backend
npm start
```

**Terminal 2 — Frontend** (port 3000):
```bash
cd frontend
npm run dev
```

Then open **http://localhost:3000** in your browser.

---

## Platform-Specific Notes

### Windows

**MySQL Installation:**
- Download MySQL Installer from [dev.mysql.com/downloads](https://dev.mysql.com/downloads/installer/)
- Choose "MySQL Server" during installation
- Remember the root password you set — you'll need it for `.env`

**Node.js Installation:**
- Download the LTS installer from [nodejs.org](https://nodejs.org/)
- The installer adds Node.js and npm to your PATH automatically

**Running the app:**
- Use **Command Prompt**, **PowerShell**, or **Git Bash**
- All commands above work identically on Windows

**Windows Firewall:** If the frontend can't reach the backend, ensure port 5000 is allowed:
```powershell
New-NetFirewallRule -DisplayName "Node Backend" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
```

---

### macOS

**MySQL Installation:**
```bash
brew install mysql
brew services start mysql
```

Set root password and create database:
```bash
mysql -u root -e "CREATE DATABASE stajproje CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root stajproje < backend/src/db/schema.sql
```

**Node.js Installation:**
```bash
brew install node
```

**Running the app:**
```bash
# Terminal 1
cd backend && npm start

# Terminal 2
cd frontend && npm run dev
```

---

### Linux (Ubuntu/Debian)

**MySQL Installation:**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

Secure the installation and create database:
```bash
sudo mysql_secure_installation
sudo mysql -u root -e "CREATE DATABASE stajproje CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -u root stajproje < backend/src/db/schema.sql
```

> If you get `Access denied` errors with the app, create a dedicated user:
> ```sql
> CREATE USER 'stajproje'@'localhost' IDENTIFIED BY 'your_password';
> GRANT ALL PRIVILEGES ON stajproje.* TO 'stajproje'@'localhost';
> FLUSH PRIVILEGES;
> ```
> Then update `backend/.env` with these credentials.

**Node.js Installation:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

**Running the app:** Same as macOS — open two terminals and run `npm start` (backend) and `npm run dev` (frontend).

---

### Linux (Fedora/RHEL)

**MySQL Installation:**
```bash
sudo dnf install mysql-server
sudo systemctl start mysqld
sudo systemctl enable mysqld
```

**Node.js Installation:**
```bash
sudo dnf install nodejs
```

---

## API Reference

Base URL: `http://localhost:5000/api`

### Customers
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/customers` | List all customers (`?type=individual\|corporate`) |
| `GET` | `/customers/:id` | Get customer details |
| `POST` | `/customers` | Create customer |
| `PUT` | `/customers/:id` | Update customer |
| `DELETE` | `/customers/:id` | Delete customer |

### Accounts
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/accounts` | List all accounts (with customer info) |
| `GET` | `/accounts/customers/:id/accounts` | List accounts for a customer |
| `POST` | `/accounts/customers/:id/accounts` | Create account for customer |
| `PUT` | `/accounts/:id` | Update account |
| `DELETE` | `/accounts/:id` | Delete account |

### Workplaces
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/workplaces` | List all workplaces |
| `GET` | `/workplaces/customers/:id/workplaces` | List workplaces for a customer |
| `POST` | `/workplaces/customers/:id/workplaces` | Create workplace |
| `PUT` | `/workplaces/:id` | Update workplace (logs status changes) |
| `DELETE` | `/workplaces/:id` | Delete workplace |

### Terminals
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/terminals` | List all terminals |
| `GET` | `/terminals/workplaces/:id/terminals` | List terminals for a workplace |
| `POST` | `/terminals/workplaces/:id/terminals` | Create terminal |
| `PUT` | `/terminals/:id` | Update terminal (closure reason rule enforced) |
| `DELETE` | `/terminals/:id` | Delete terminal |

### Other
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/search?q=` | Global search (customers, workplaces, terminals) |
| `GET` | `/logs?entity_type=&limit=&offset=` | Operation logs with pagination |
| `GET` | `/dashboard/stats` | Dashboard statistics |
| `GET` | `/export/customers` | Download customers as Excel (.xlsx) |
| `GET` | `/export/terminals` | Download terminals as Excel (.xlsx) |
| `GET` | `/health` | Health check |

---

## Business Rules Implemented

1. **TC Kimlik No Validation** — Turkish ID algorithm: 11 digits, first digit ≠ 0, 10th digit = (odd-position-sum × 7 − even-position-sum) mod 10, 11th digit = sum-of-first-10 mod 10.

2. **IBAN Validation** — mod 97 check per ISO 13616. Turkish IBAN format (TR + 24 digits) validated additionally.

3. **Dynamic Closure Reason** — When updating a terminal and setting status to 0 (Closed), the closure reason field becomes visible and required. On creation or when status ≠ 0, the field is hidden.

4. **Type-Based Forms** — Customer form dynamically renders individual-specific fields (TC Kimlik, father/mother name, birth date/place, gender, education, marital status) or corporate-specific fields (tax ID, public status) based on the selected customer type.

5. **Input Masking** — TC Kimlik No: `___ ___ ___ __` format. Phone: `(5__) ___ __ __` format. Masks are applied during typing; raw values sent to the backend.

6. **Audit Trail** — Every workplace or terminal status change is logged with entity type, old value, new value, who changed it, and timestamp.

---

## Security Notes

- **`.env` is gitignored** — database credentials, API keys, and secrets are never committed.
- **`.env.example` is committed** — serves as a template for new developers. Contains placeholder values only.
- **`.gitignore` covers**: `node_modules/`, `dist/`, `*.log`, `*.pem`, `*.key`, credentials files, OS files (`.DS_Store`, `Thumbs.db`), IDE configs.
- **CORS** is enabled for development. For production, restrict the origin to your domain.
- **No authentication** is implemented — this is a demo/internal system. Add auth middleware before deploying publicly.
- **Input validation** is performed server-side on all endpoints.
- **SQL injection** is prevented via parameterized queries (mysql2 prepared statements).

---

## Scripts

### Backend
```bash
npm start          # Start production server (node src/index.js)
npm run dev        # Start with auto-reload (nodemon)
```

### Frontend
```bash
npm run dev        # Start Vite dev server with HMR (port 3000)
npm run build      # Production build to dist/
npm run preview    # Preview production build locally
npm run lint       # Run Oxlint
```

---

## License

This project is developed as an internship project (Staj Projesi).

---

## Authors

- **Taha Yılmaz** — [@tahayilmaz22](https://github.com/tahayilmaz22)
