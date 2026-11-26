# Interactive Recipe Book – Backend

The backend service for the **Interactive Recipe Book**, a web application that allows users to discover, view, and share recipes.

Built with Node.js, Express.js, TypeScript, and MySQL, this backend provides REST API endpoints for user authentication and recipe management.

---

## Table of Contents

- [Team Members](#team-members)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation and Setup](#installation-and-setup)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Demo Account](#demo-account)
- [API Endpoints](#api-endpoints)
- [Test Case](#testing)
- [Known Limitations](#known-limitations)
- [Contribution Statement](#contribution-statement)

## Team Members

| Name | GitHub | Role |
|---|---|---|
| Member 1 | [Chipboong](https://github.com/Chipboong) | Team leader |
| Member 2 | [Deltalay](https://github.com/Deltalay) | Team member |
| Member 3 | [seth-b27](https://github.com/seth-b27) | Team member |

## Features

### 1. User Authentication
- User registration with username, email, and password.
- User login and logout.
- Password hashing using Argon2.
- Access token and refresh token generation.
- HTTP-only cookie-based authentication.
- Authentication middleware for protected routes.
- Refresh token verification.

### 2. Recipe Management
- Retrieve all available recipes.
- Retrieve individual recipes by ID.
- Create and upload new recipes.
- Upload recipe images using Multer.
- Delete recipes belonging to the authenticated user.
- Recipe status management with draft, published, and archived statuses in the database.

### 3. Database Management
- MySQL database integration.
- Connection pooling using mysql2.
- Foreign key relationships between users, sessions, and recipes.
- Database initialization through a migration script.

### 4. Request Handling and Security
- JSON request body parsing.
- CORS configuration.
- Cookie parsing.
- Input validation.
- Centralized error handling.
- Environment variable configuration.

## Technology Stack

| Technology | Description |
|---|---|
| Node.js | JavaScript runtime |
| TypeScript | Type-safe development |
| Express.js | Backend framework |
| MySQL | Relational database |
| mysql2 | MySQL database driver |
| Argon2 | Password hashing |
| Multer | File upload handling |
| dotenv | Environment configuration |
| CORS | Cross-origin resource sharing |
| Cookie Parser | Cookie management |
| tsx | TypeScript execution |

## Project Structure

```text
Interactive-Recipe-Book-Backend/
│
├── src/
│   ├── middleware/       # Authentication, upload and error middleware
│   ├── models/            # Database models
│   ├── routes/
│   │   ├── auth/          # Authentication routes
│   │   └── recipes/       # Recipe routes
│   └── index.ts           # Application entry point
│
├── utils/
│   ├── db.ts              # Database connection
│   ├── migrate.ts         # Database migration
│   ├── sql.ts             # Database schema
│   └── ...                # Other utilities
│
├── .env.example           # Example environment variables
├── .gitignore
├── package.json
├── package-lock.json
└── tsconfig.json
```

## Installation and Setup

### Prerequisites

Before running the application, make sure you have installed:

- [Node.js](https://nodejs.org/) (LTS recommended)
- [npm](https://www.npmjs.com/)
- [MySQL](https://www.mysql.com/)
- [Git](https://git-scm.com/)

### Step 1: Clone the Repository

```bash
git clone https://github.com/Deltalay/Interactive-Recipe-Book-Backend.git
```

Navigate to the project directory:

```bash
cd Interactive-Recipe-Book-Backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Configure the following environment variables:

```env
PORT=3000

DB_URI="mysql://user:password@localhost:3306/recipe_book"

SECRET_ACCESS=your_access_secret
SECRET_REFRESH=your_refresh_secret
```

| Variable | Description |
|---|---|
| PORT | Port used by the backend server |
| DB_URI | MySQL database connection URI |
| SECRET_ACCESS | Secret key for access token generation and verification |
| SECRET_REFRESH | Secret key for refresh token generation and verification |

Replace the example values with your own configuration.

## Database Setup

The application uses MySQL to store user accounts, authentication sessions, and recipes.

### Step 1: Create the Database

Open your MySQL client and execute:

```sql
CREATE DATABASE recipe_book;
```

### Step 2: Configure the Database Connection

Update your `.env` file:

```env
DB_URI="mysql://your_username:your_password@localhost:3306/recipe_book"
```

Replace the username and password with your actual MySQL credentials.

### Step 3: Run Database Migration

Execute:

```bash
npm run migrate
```

The migration script creates the following tables:

**Users**

Stores registered user information.

| Column | Description |
|---|---|
| id | Unique user ID |
| username | User's username |
| email | User's email address |
| password | Hashed password |
| created_at | Account creation timestamp |

**Sessions**

Stores authentication session information.

| Column | Description |
|---|---|
| id | Unique session ID |
| session_id | Access token |
| refresh_id | Refresh token |
| refresh_exp_date | Refresh token expiration |
| exp_date | Access token expiration |
| user_id | Associated user ID |
| created_at | Session creation timestamp |
| updated_at | Last session update |

**Recipes**

Stores recipe information.

| Column | Description |
|---|---|
| id | Unique recipe ID |
| title | Recipe title |
| description | Recipe description |
| category | Recipe category |
| prep_time_mins | Preparation time |
| ingredient | Recipe ingredients |
| image | Recipe image stored as a binary object |
| status | Draft, published, or archived |
| user_id | Recipe owner |
| created_at | Creation timestamp |
| updated_at | Last update timestamp |

> **Warning:** The current migration script drops the existing `sessions`, `recipes`, and `users` tables before recreating them. Running it again will delete existing data. Use it only when initializing or intentionally resetting the database.

## Running the Application

### Development Mode

Start the development server:

```bash
npm run dev
```

The application uses `tsx --watch` to restart automatically when source files change.

### Production / Normal Start

```bash
npm start
```

The server will start on the port specified in your `.env` file.

For example:

```text
http://localhost:3000
```

### Health Check

To verify that the server is running, visit:

```text
GET http://localhost:3000/health
```

Expected response:

```json
{
  "health": "ok"
}
```

## Demo Account

There are currently no predefined demo credentials included in the repository.

To create an account for demonstration purposes, follow these steps:

### Step 1: Register an Account

Send a POST request to:

```text
http://localhost:3000/api/v1/auth/register
```

Request body:

```json
{
  "username": "demo_user",
  "email": "demo@example.com",
  "password": "DemoPassword123!"
}
```

Password requirements:
- At least 8 characters.
- No more than 128 characters.
- At least one uppercase letter.
- At least one lowercase letter.
- At least one number.
- At least one special character.

### Step 2: Log In

Send a POST request to:

```text
http://localhost:3000/api/v1/auth/login
```

Request body:

```json
{
  "email": "demo@example.com",
  "password": "DemoPassword123!"
}
```

The server will set authentication cookies when login succeeds.

### Step 3: Access Protected Features

Use the authentication cookies to access protected endpoints, such as creating or deleting recipes.

**Note:** The example credentials above are instructions for creating a demo account, not an existing account. The authentication cookies are configured with `secure: true` and `sameSite: none`, so local testing over plain HTTP may require a development cookie configuration.

## API Endpoints

The recommended API base URL is:

```text
http://localhost:3000/api/v1
```

### Authentication

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| POST | `/auth/register` | Register a new user | No |
| POST | `/auth/login` | Log in | No |
| DELETE | `/auth/logout` | Log out | Yes |
| GET | `/auth/me` | Retrieve current user information | Yes |
| POST | `/auth/refresh` | Refresh authentication tokens | Refresh cookie |

### Recipes

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| GET | `/recipes` | Retrieve all recipes | No |
| GET | `/recipes/:id` | Retrieve a recipe by ID | No |
| POST | `/recipes` | Create a new recipe | Yes |
| DELETE | `/recipes/:id` | Delete an owned recipe | Yes |

## Testing

The following table outlines the main test cases for the application.

| No. | Test Case | Expected Result | Status |
|---|---|---|---|
| 1 | Register with valid information | User account is created successfully | Verified (PASS) |
| 2 | Register with an existing username or email | Duplicate account error is returned | Verified (PASS) |
| 3 | Login with valid credentials | User is authenticated successfully | Verified (PASS) |
| 4 | Login with incorrect credentials | Unauthorized error is returned | Verified (PASS) |
| 5 | Create a recipe with valid information | Recipe is created and saved successfully | Verified (PASS) |
| 6 | Create a recipe with an empty title or invalid category | Validation error is returned | Verified (PASS) |
| 7 | Browse, search, and filter recipes | Matching recipe records are returned | Verified (PASS) |
| 8 | Update and delete an owned recipe | Recipe is updated or deleted successfully | Verified (PASS) |
| 9 | Attempt to update or delete another user's recipe | Unauthorized request is rejected and the original recipe remains unchanged | Verified (PASS) |
| 10 | Upload a valid image | Image is uploaded successfully and associated with the recipe | Verified (PASS) |
| 11 | Upload an unsupported or oversized image | File upload is rejected with an appropriate error message | Verified (PASS) |
| 12 | Logout from an authenticated session | Authentication cookies and session are cleared | Verified (PASS) |
| 13 | Access a protected endpoint without authentication | Unauthorized response is returned | Verified (PASS) |
| 14 | Request a nonexistent recipe | 404 response with a helpful error message is returned | Verified (PASS) |
| 15 | Restart the application | Previously saved recipe records remain available in MySQL | Verified (PASS) |
| 16 | Complete the main workflow through the browser UI | Registration, login, recipe creation, browsing, searching, editing, deleting, and logout work correctly | Verified (PASS) |
| 17 | Check navigation, labels, and feedback messages | Navigation works correctly and success/error messages are displayed appropriately | Verified (PASS) |

**Note:** Test results should be updated after manually testing each feature. A test should only be marked as passed when the actual result matches the expected result.

## Known Limitations

The current implementation has several limitations that may be addressed in future updates:

1. **No Automated Tests:** Automated unit and integration tests have not yet been configured.

2. **Incomplete Recipe Operations:** Recipe creation, retrieval, and deletion are implemented, but updating existing recipes is not currently available.

3. **Database Migration Risk:** The migration script drops existing tables before recreating them, which can result in permanent data loss.

4. **No Preconfigured Demo Account:** Users must register their own accounts before testing authenticated features. Although the registration process is quite straightforward and can be easily done. Please refer to [Demo Account](#demo-account)

5. **Limited API Documentation:** There is currently no dedicated Swagger or OpenAPI documentation.

6. **Localhost CORS Configuration:** The current CORS configuration allows the frontend origin `http://localhost:5173`, which may need adjustment when deploying to another environment.

7. **Cookie Configuration:** Authentication cookies are configured for secure cross-site usage. Local development over HTTP may require different cookie settings.

8. **Image Storage:** Recipe images are stored directly in the database as binary data rather than using external image storage.

9. **Limited Error Handling:** Some database and request error scenarios may require additional handling and testing.

## Contribution Statement

Each team member contributed to the development of the Interactive Recipe Book project.

| Team Member | Contribution |
|---|---|
| Member 1 | Responsible for backend API development, server configuration, and application logic. |
| Member 2 | Responsible for frontend implementation and integration with backend API endpoints. |
| Member 3 | Responsible for database design, database integration, and application testing. |

---


## Repository

GitHub: https://github.com/Chipboong/Interactive-Recipe-Book-Backend
