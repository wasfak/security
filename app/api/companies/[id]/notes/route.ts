import { NextRequest, NextResponse } from "next/server";
import Company from "@/lib/models/company";
import { dbConnect } from "@/lib/db";
import { Types } from "mongoose";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();
    const { notes } = await request.json();
    const { id } = await params;
    const companyId = id;

    // Validate MongoDB ObjectId
    if (!Types.ObjectId.isValid(companyId)) {
      return NextResponse.json(
        { error: "Invalid company ID" },
        { status: 400 },
      );
    }

    // Find company
    const company = await Company.findById(companyId);

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Initialize history if it doesn't exist
    if (!company.notesHistory) {
      company.notesHistory = [];
    }

    // Add the CURRENT note to history before updating (preserves all changes)
    if (company.notes !== undefined && company.notes !== null) {
      company.notesHistory.push({
        notes: company.notes,
        changedAt: new Date(),
      });
    }

    // Update to the new note
    company.notes = notes || "";

    await company.save();

    return NextResponse.json({
      notes: company.notes,
      notesHistory: company.notesHistory,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update notes" },
      { status: 500 },
    );
  }
}
