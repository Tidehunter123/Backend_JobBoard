import express from "express";

import { getProJobs, getComJobs, getJobs } from "../controllers/jobsController";

const router = express.Router();

router.get("/pro-jobs", getProJobs);
router.get("/com-jobs", getComJobs);
router.get("/jobs", getJobs);

export default router;
