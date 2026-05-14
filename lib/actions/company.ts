"use server";

import { z } from "zod";
import { dbConnect } from "@/lib/db";
import Company from "@/lib/models/company";

const CompanySchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(200),
  phoneNumber: z.string().min(11, "Phone number is required").max(50),
  purchasePerson: z
    .string()
    .min(1, "Purchase person name is required")
    .max(200),
  notes: z.string().max(2000).optional(),
});

export type CompanyFormData = z.infer<typeof CompanySchema>;

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Converts a wildcard pattern to a regex pattern
 * Examples:
 *   "m*e*h*a*" -> matches "mehan", "mehran", "m1e2h3a4"
 *   "mehan" -> matches "mehan" (treated as literal but case-insensitive)
 *   "m*h*n" -> matches "mohan", "mahan", "m1h2n3"
 */
function convertWildcardToRegex(pattern: string): RegExp {
  // Split by * to get the parts
  const parts = pattern.split("*").filter((part) => part.length > 0);

  if (parts.length === 0) {
    // Empty pattern matches everything
    return /.*/i;
  }

  // Escape special regex characters in each part and join with .*
  const regexPattern = parts
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");

  // Wrap with .* at start and end to match anywhere in the string
  return new RegExp(`.*${regexPattern}.*`, "i");
}

export async function saveCompany(
  data: CompanyFormData,
): Promise<ActionResult> {
  const parsed = CompanySchema.safeParse(data);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Validation failed";
    return { success: false, error: firstError };
  }

  try {
    await dbConnect();
    await Company.create(parsed.data);
    return { success: true };
  } catch (err: unknown) {
    const error = err as Record<string, unknown>;
    // Handle duplicate key error (unique constraint violation)
    if (error.code === 11000 || (error.message as string)?.includes("E11000")) {
      return {
        success: false,
        error: "Company name already exists. Please use a different name.",
      };
    }

    // Handle index build failure with duplicate key
    if (
      (error.message as string)?.includes("Index build failed") &&
      (error.message as string)?.includes("E11000")
    ) {
      return {
        success: false,
        error: "Company name already exists. Please use a different name.",
      };
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(
        error.errors as Record<string, Record<string, unknown>>,
      )
        .map((e) => (e as Record<string, unknown>).message)
        .join(", ");
      return {
        success: false,
        error: `Validation error: ${messages}`,
      };
    }

    // Handle connection errors
    if (
      (error.message as string)?.includes("connect") ||
      (error.message as string)?.includes("ECONNREFUSED")
    ) {
      return {
        success: false,
        error:
          "Database connection failed. Please check your internet connection.",
      };
    }

    // Handle timeout errors
    if (
      (error.message as string)?.includes("timeout") ||
      (error.message as string)?.includes("ETIMEDOUT")
    ) {
      return {
        success: false,
        error: "Request timed out. Please try again.",
      };
    }

    // Return user-friendly generic error
    return {
      success: false,
      error: "Failed to save company. Please try again.",
    };
  }
}

export async function getCompanies(
  startDate?: Date,
  endDate?: Date,
  searchName?: string,
  smartSearchName?: string,
) {
  try {
    await dbConnect();

    const query: Record<string, unknown> = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        (query.createdAt as Record<string, Date>).$gte = startDate;
      }
      if (endDate) {
        const nextDay = new Date(endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        (query.createdAt as Record<string, Date>).$lt = nextDay;
      }
    }

    // Regular search (case-insensitive substring match)
    if (searchName && searchName.trim()) {
      query.companyName = {
        $regex: searchName.trim(),
        $options: "i",
      };
    }

    // Smart search (wildcard fuzzy match)
    if (smartSearchName && smartSearchName.trim()) {
      const regex = convertWildcardToRegex(smartSearchName.trim());
      query.companyName = {
        $regex: regex.source,
        $options: "i",
      };
    }

    const companies = await Company.find(query).sort({ createdAt: -1 });

    return {
      success: true,
      data: JSON.parse(JSON.stringify(companies)),
    };
  } catch (err) {
    console.error("[getCompanies] DB error:", err);
    return {
      success: false,
      data: [],
      error: "Failed to fetch companies. Please try again.",
    };
  }
}
