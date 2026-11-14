/**
 * USERS one to one SESSIONS;
 * USERS one to many recipe;
 */
export const UP_DB: string[] = [
    `DROP TABLE IF EXISTS sessions;`,
    `DROP TABLE IF EXISTS recipes;`,
    `DROP TABLE IF EXISTS users;`,
    `
        CREATE TABLE IF NOT EXISTS users(
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(30) NOT NULL,
            email VARCHAR(70) NOT NULL UNIQUE,
            password VARCHAR(120) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        `,
    `
        CREATE TABLE IF NOT EXISTS sessions(
            id INT AUTO_INCREMENT PRIMARY KEY,
            session_id VARCHAR(70) NOT NULL,
            exp_date DATETIME NOT NULL,
            user_id INT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );`,
    `
        CREATE TABLE IF NOT EXISTS recipes(
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(50) NOT NULL,
            description TEXT NOT NULL,
            prep_time_mins TEXT NOT NULL,
            ingredient TEXT NOT NULL,
            image BLOB,
            status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
            user_id INT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );`,
];
