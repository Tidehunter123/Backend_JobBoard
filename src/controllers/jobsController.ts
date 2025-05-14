import { Request, Response } from "express";
import catchAsync from "../utils/catchAsync"; // Adjust the import path accordingly
import {
  getProJobsData,
  getComJobsData,
  getJobsData,
  getJobByIdData,
} from "../services/jobsService";

interface JobsQueryParams {
  page?: string;
  keyword?: string;
  workTypes?: string;
  paymentTypes?: string;
  jobTypes?: string;
  user?: string;
}

export const getJobs = catchAsync(async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      keyword,
      workTypes,
      paymentTypes,
      jobTypes,
      // user,
    } = req.query as JobsQueryParams;

    const pageNumber = parseInt(page, 10);
    const pageSize = 10; // Number of items per page

    const filters = {
      keyword,
      workTypes: workTypes?.split(",") || [],
      paymentTypes: paymentTypes?.split(",") || [],
      jobTypes: jobTypes?.split(",") || [],
      // user: user || "",
    };

    const { jobs, totalCount } = await getJobsData(
      filters,
      pageNumber,
      pageSize
    );

    const hasNextPage = pageNumber * pageSize < totalCount;

    res.status(200).json({
      jobs,
      hasNextPage,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: pageNumber,
    });
  } catch (error) {
    console.error("Error in getProJobs:", error);
    res.status(500).json({ message: "Error fetching jobs data" });
  }
});

export const getJobById = catchAsync(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const job = await getJobByIdData(id);
    res.status(200).json(job);
  } catch (error) {
    console.error("Error in getJobById:", error);
    res.status(500).json({ message: "Error fetching job data" });
  }
});

// Define the getTagData function
export const getProJobs = catchAsync(async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      keyword,
      workTypes,
      paymentTypes,
      jobTypes,
    } = req.query as JobsQueryParams;

    const pageNumber = parseInt(page, 10);
    const pageSize = 10; // Number of items per page

    const filters = {
      keyword,
      workTypes: workTypes?.split(",") || [],
      paymentTypes: paymentTypes?.split(",") || [],
      jobTypes: jobTypes?.split(",") || [],
    };

    const { jobs, totalCount } = await getProJobsData(
      filters,
      pageNumber,
      pageSize
    );

    const hasNextPage = pageNumber * pageSize < totalCount;

    res.status(200).json({
      jobs,
      hasNextPage,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: pageNumber,
    });
  } catch (error) {
    console.error("Error in getProJobs:", error);
    res.status(500).json({ message: "Error fetching jobs data" });
  }
});

export const getComJobs = catchAsync(async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      keyword,
      workTypes,
      paymentTypes,
      jobTypes,
    } = req.query as JobsQueryParams;

    const pageNumber = parseInt(page, 10);
    const pageSize = 10; // Number of items per page

    const filters = {
      keyword,
      workTypes: workTypes?.split(",") || [],
      paymentTypes: paymentTypes?.split(",") || [],
      jobTypes: jobTypes?.split(",") || [],
    };

    const { jobs, totalCount } = await getComJobsData(
      filters,
      pageNumber,
      pageSize
    );

    const hasNextPage = pageNumber * pageSize < totalCount;

    res.status(200).json({
      jobs,
      hasNextPage,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: pageNumber,
    });
  } catch (error) {
    console.error("Error in getComJobs:", error);
    res.status(500).json({ message: "Error fetching jobs data" });
  }
});
