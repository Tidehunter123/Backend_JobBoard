import express from "express";

import {
  getProJobs,
  getComJobs,
  getJobs,
  getJobById,
} from "../controllers/jobsController";

const router = express.Router();

router.get("/pro-jobs", getProJobs);
router.get("/com-jobs", getComJobs);
router.get("/jobs", getJobs);
router.get("/jobs/:id", getJobById);

export default router;
