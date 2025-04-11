import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import cors from "cors";
import routes from "./routes";
import bodyParser from "body-parser";

dotenv.config();

const app = express();
const upload = multer();
const PORT = Number(process.env.PORT) || 3001; // ✅ Convert to number

app.use(
  bodyParser.json({
    verify: function (req: any, res, buf) {
      req.rawBody = buf;
    },
  })
);
app.use(express.json());

// ✅ CORS Configuration
app.use(
  cors({
    origin: ["https://jobslist.searchfundfellows.com", "http://localhost:3000"], // Allow frontend
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow cookies/tokens
  })
);

// ✅ Handle Preflight Requests Manually (OPTIONS)
app.options("*", (req, res) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://jobslist.searchfundfellows.com, http://localhost:3000"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.header("Access-Control-Allow-Credentials", "true");
  res.sendStatus(200);
});

app.use("/api/", routes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
