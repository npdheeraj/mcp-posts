import express from "express";
import dotenv from "dotenv";
import routes from "./api/routes";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.API_PORT || "3000");

// Middleware
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api", routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// Error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err);
    res.status(500).json({ success: false, error: "Internal server error" });
  },
);

// Start server
const server = app.listen(PORT, () => {
  console.log(`\n🚀 REST API Server running on http://localhost:${PORT}`);
  console.log(`📝 Posts CRUD API ready for requests\n`);
});

export default server;
