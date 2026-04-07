import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function initializeDatabase() {
  try {
    // Create connection to MySQL without specifying database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    });

    const dbName = process.env.DB_NAME || "posts_crud_db";

    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✓ Database ${dbName} created or already exists`);

    // Select the database
    await connection.execute(`USE ${dbName}`);

    // Create posts table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content LONGTEXT NOT NULL,
        author VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("✓ Posts table created or already exists");

    // Create index for better query performance
    await connection.execute(`
      CREATE INDEX IF NOT EXISTS idx_author ON posts(author)
    `);
    console.log("✓ Index on author column created");

    await connection.end();
    console.log("\n✓ Database initialization completed successfully!");
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
}

initializeDatabase();
