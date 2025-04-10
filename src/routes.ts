import express from "express";

import jobsApi from "./apis/jobsApi";

const router = express.Router();

router.use("/jobs", jobsApi);

export default router;
