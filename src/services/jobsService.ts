// Import necessary dependencies
import Airtable from "airtable";
import dotenv from "dotenv";
import { supabase } from "../config/superbaseConfig";

dotenv.config();

// Initialize Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.AIRTABLE_BASE_ID || "");

interface AttachmentField {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: string;
  thumbnails?: {
    small: { url: string; width: number; height: number };
    large: { url: string; width: number; height: number };
    full: { url: string; width: number; height: number };
  };
}

interface JobPosting {
  id: string;
  jobPostingId: string;
  companyName: string;
  jobTitle: string;
  idealStartDate: string;
  anticipatedEndDate: string;
  remoteInPerson: string;
  location: string;
  hoursPerWeek: number;
  paidUnpaid: string;
  jobPostingURL: string;
  companyLogo: AttachmentField[] | null;
  companyType: string;
  companyDescription: string;
  ats: string;
  externalLink: string;
  status: string;
  jobType: string;
  created_At?: string;
  jobDescription?: string;
  email?: string;
  website?: string;
  applicationLink?: string;
}

interface JobFilters {
  keyword?: string;
  workTypes: string[];
  paymentTypes: string[];
  jobTypes: string[];
  user?: string;
}

interface JobsResponse {
  jobs: JobPosting[];
  totalCount: number;
}

const buildFilterFormula = (
  baseFilter: string,
  filters: JobFilters
): string => {
  const conditions: string[] = [baseFilter];

  if (filters.keyword) {
    // Escape single quotes in the keyword to prevent formula errors
    const safeKeyword = filters.keyword.replace(/'/g, "\\'");
    // Convert to lowercase for case-insensitive search
    const lowercaseKeyword = safeKeyword.toLowerCase();

    conditions.push(
      `
      OR(
        LOWER({Company Name}) = '${lowercaseKeyword}',
        FIND('${lowercaseKeyword}', LOWER({Company Name})) > 0,
        LOWER({Job Title}) = '${lowercaseKeyword}',
        FIND('${lowercaseKeyword}', LOWER({Job Title})) > 0,
        LOWER({Job Description}) = '${lowercaseKeyword}',
        FIND('${lowercaseKeyword}', LOWER({Job Description})) > 0
      )
    `
        .replace(/\s+/g, " ")
        .trim()
    );
  }

  if (filters.workTypes.length > 0) {
    const workTypeConditions = filters.workTypes
      .map((type) => `{Remote/In person} = '${type}'`)
      .join(", ");
    conditions.push(`OR(${workTypeConditions})`);
  }

  if (filters.paymentTypes.length > 0) {
    const paymentTypeConditions = filters.paymentTypes
      .map((type) => `{Paid/Unpaid} = '${type}'`)
      .join(", ");
    conditions.push(`OR(${paymentTypeConditions})`);
  }

  if (filters.jobTypes.length > 0) {
    // For multiple select fields, we need to check if any of the selected values are in the field
    const jobTypeConditions = filters.jobTypes
      .map((type) => `FIND('${type}', {Job Type}) > 0`)
      .join(", ");
    conditions.push(`OR(${jobTypeConditions})`);
  }

  return `AND(${conditions.join(", ")})`;
};

// Function to get professional jobs data
export const getProJobsData = async (
  filters: JobFilters,
  page: number,
  pageSize: number
): Promise<JobsResponse> => {
  try {
    const baseFilter =
      "AND({Job Type} = 'MBAs', NOT({Status} = 'Not approved'))";
    const filterFormula = buildFilterFormula(baseFilter, filters);

    const allRecords = await base("Job Postings")
      .select({
        view: "Grid view",
        filterByFormula: filterFormula,
        fields: [
          "Job Posting Id",
          "Company Name",
          "Job Title",
          "Ideal Start Date",
          "Anticipated end date",
          "Remote/In person",
          "Location",
          "Hours Per Week",
          "Paid/Unpaid",
          "Job Posting URL",
          "Company Logo",
          "Company Type",
          "Company Description",
          "ATS",
          "External Link",
          "Status",
          "Job Type",
        ],
      })
      .all();

    const totalCount = allRecords.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedRecords = allRecords.slice(
      startIndex,
      startIndex + pageSize
    );

    const jobs = paginatedRecords.map((record) => ({
      id: record.id,
      jobPostingId: record.get("Job Posting Id") as string,
      companyName: record.get("Company Name") as string,
      jobTitle: record.get("Job Title") as string,
      idealStartDate: record.get("Ideal Start Date") as string,
      anticipatedEndDate: record.get("Anticipated end date") as string,
      remoteInPerson: record.get("Remote/In person") as string,
      location: record.get("Location") as string,
      hoursPerWeek: record.get("Hours Per Week") as number,
      paidUnpaid: record.get("Paid/Unpaid") as string,
      jobPostingURL: record.get("Job Posting URL") as string,
      companyLogo: (record.get("Company Logo") as AttachmentField[]) || null,
      companyType: record.get("Company Type") as string,
      companyDescription: record.get("Company Description") as string,
      ats: record.get("ATS") as string,
      externalLink: record.get("External Link") as string,
      status: record.get("Status") as string,
      jobType: record.get("Job Type") as string,
    }));

    return { jobs, totalCount };
  } catch (error) {
    console.error("Error in getProJobsData:", error);
    throw error;
  }
};

// Function to get professional jobs data
export const getJobsData = async (
  filters: JobFilters,
  page: number,
  pageSize: number
): Promise<JobsResponse> => {
  try {
    console.log(filters.user, "email");
    let allRecords;
    // if (!filters.user) {
    //   const baseFilter = `NOT({Status} = 'Pending'))`;

    //   allRecords = await base("Job Postings")
    //     .select({
    //       view: "Grid view",
    //       filterByFormula: `AND(${baseFilter}`,
    //       fields: [
    //         "Job Posting Id",
    //         "Company Name",
    //         "Job Title",
    //         "Ideal Start Date",
    //         "Anticipated end date",
    //         "Remote/In person",
    //         "Location",
    //         "Hours Per Week",
    //         "Paid/Unpaid",
    //         "Job Posting URL",
    //         "Company Logo",
    //         "Company Type",
    //         "Company Description",
    //         "ATS",
    //         "External Link",
    //         "Status",
    //         "Job Type",
    //         "Created_at",
    //       ],
    //       sort: [{ field: "Created_at", direction: "desc" }],
    //     })
    //     .all();
    // } else {
    // const userType = await base("SFF Candidate Database")
    //   .select({
    //     view: "All Applications",
    //     filterByFormula: `{Email} = '${filters.user}'`,
    //     fields: ["Canidate Type"],
    //   })
    //   .all();

    // if (!userType || userType.length === 0) {
    //   throw new Error("User type not found");
    // }

    // const candidateType = userType[0].get("Canidate Type") as string;
    // console.log("Candidate Type:", candidateType);

    // const jobType =
    //   candidateType === "Experienced Professional"
    //     ? "Experienced"
    //     : "Early Career";
    // console.log("Job Type:", jobType); a

    const baseFilter = `{Status} = 'Approved')`;
    const filterFormula = buildFilterFormula(`AND(${baseFilter}`, filters);

    allRecords = await base("Job Postings")
      .select({
        view: "Grid view",
        filterByFormula: filterFormula,
        fields: [
          "Job Posting Id",
          "Company Name",
          "Job Title",
          "Job Description",
          "Ideal Start Date",
          "Anticipated end date",
          "Remote/In person",
          "Location",
          "Hours Per Week",
          "Paid/Unpaid",
          "Job Posting URL",
          "Company Logo",
          "Company Type",
          "Company Description",
          "ATS",
          "External Link",
          "Status",
          "Job Type",
          "Created_at",
        ],
        sort: [{ field: "Created_at", direction: "desc" }],
      })
      .all();
    // }

    const totalCount = allRecords.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedRecords = allRecords.slice(
      startIndex,
      startIndex + pageSize
    );

    const jobs = paginatedRecords.map((record) => ({
      id: record.id,
      jobPostingId: record.get("Job Posting Id") as string,
      companyName: record.get("Company Name") as string,
      jobTitle: record.get("Job Title") as string,
      idealStartDate: record.get("Ideal Start Date") as string,
      anticipatedEndDate: record.get("Anticipated end date") as string,
      remoteInPerson: record.get("Remote/In person") as string,
      location: record.get("Location") as string,
      hoursPerWeek: record.get("Hours Per Week") as number,
      paidUnpaid: record.get("Paid/Unpaid") as string,
      jobPostingURL: record.get("Job Posting URL") as string,
      companyLogo: (record.get("Company Logo") as AttachmentField[]) || null,
      companyType: record.get("Company Type") as string,
      companyDescription: record.get("Company Description") as string,
      ats: record.get("ATS") as string,
      externalLink: record.get("External Link") as string,
      status: record.get("Status") as string,
      jobType: record.get("Job Type") as string,
      jobDescription: record.get("Job Description") as string,
      created_At: record.get("Created_at") as string,
    }));

    return { jobs, totalCount };
  } catch (error) {
    console.error("Error in getJobsData:", error);
    throw error;
  }
};

// Function to get job by id data
export const getJobByIdData = async (id: string): Promise<JobPosting> => {
  try {
    const record = await base("Job Postings").find(id);
    return {
      id: record.id,
      jobPostingId: record.get("Job Posting Id") as string,
      companyName: record.get("Company Name") as string,
      jobTitle: record.get("Job Title") as string,
      idealStartDate: record.get("Ideal Start Date") as string,
      anticipatedEndDate: record.get("Anticipated end date") as string,
      remoteInPerson: record.get("Remote/In person") as string,
      location: record.get("Location") as string,
      hoursPerWeek: record.get("Hours Per Week") as number,
      paidUnpaid: record.get("Paid/Unpaid") as string,
      jobPostingURL: record.get("Job Posting URL") as string,
      companyLogo: (record.get("Company Logo") as AttachmentField[]) || null,
      companyType: record.get("Company Type") as string,
      companyDescription: record.get("Company Description") as string,
      ats: record.get("ATS") as string,
      externalLink: record.get("External Link") as string,
      status: record.get("Status") as string,
      jobType: record.get("Job Type") as string,
      created_At: record.get("Created_at") as string,
      jobDescription: record.get("Job Description") as string,
      email: record.get("Email") as string,
      website: record.get("Company Website") as string,
      applicationLink: record.get("Application Page URL") as string,
    };
  } catch (error) {
    console.error("Error in getJobByIdData:", error);
    throw error;
  }
};

// Function to get company jobs data
export const getComJobsData = async (
  filters: JobFilters,
  page: number,
  pageSize: number
): Promise<JobsResponse> => {
  try {
    const baseFilter =
      "AND({Job Type} = 'Graduates', NOT({Status} = 'Not approved'))";
    const filterFormula = buildFilterFormula(baseFilter, filters);

    const allRecords = await base("Job Postings")
      .select({
        view: "Grid view",
        filterByFormula: filterFormula,
        fields: [
          "Job Posting Id",
          "Company Name",
          "Job Title",
          "Ideal Start Date",
          "Anticipated end date",
          "Remote/In person",
          "Location",
          "Hours Per Week",
          "Paid/Unpaid",
          "Job Posting URL",
          "Company Logo",
          "Company Type",
          "Company Description",
          "ATS",
          "External Link",
          "Status",
          "Job Type",
        ],
      })
      .all();

    const totalCount = allRecords.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedRecords = allRecords.slice(
      startIndex,
      startIndex + pageSize
    );

    const jobs = paginatedRecords.map((record) => ({
      id: record.id,
      jobPostingId: record.get("Job Posting Id") as string,
      companyName: record.get("Company Name") as string,
      jobTitle: record.get("Job Title") as string,
      idealStartDate: record.get("Ideal Start Date") as string,
      anticipatedEndDate: record.get("Anticipated end date") as string,
      remoteInPerson: record.get("Remote/In person") as string,
      location: record.get("Location") as string,
      hoursPerWeek: record.get("Hours Per Week") as number,
      paidUnpaid: record.get("Paid/Unpaid") as string,
      jobPostingURL: record.get("Job Posting URL") as string,
      companyLogo: (record.get("Company Logo") as AttachmentField[]) || null,
      companyType: record.get("Company Type") as string,
      companyDescription: record.get("Company Description") as string,
      ats: record.get("ATS") as string,
      externalLink: record.get("External Link") as string,
      status: record.get("Status") as string,
      jobType: record.get("Job Type") as string,
    }));

    return { jobs, totalCount };
  } catch (error) {
    console.error("Error in getProJobsData:", error);
    throw error;
  }
};
