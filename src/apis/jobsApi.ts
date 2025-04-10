import express from "express";

import { getProJobs, getComJobs } from "../controllers/jobsController";

const router = express.Router();

router.get("/pro-jobs", getProJobs);
router.get("/com-jobs", getComJobs);

export default router;
