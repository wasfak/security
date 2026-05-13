"use client";

import { useState } from "react";
import {
  Calendar,
  Search,
  Building2,
  Edit2,
  Save,
  X,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getCompanies } from "@/lib/actions/company";

type CompanyData = {
  _id: string;
  companyName: string;
  phoneNumber: string;
  purchasePerson: string;
  notes?: string;
  createdAt: Date;
  notesHistory?: Array<{ notes: string; changedAt: Date }>;
};

interface CompanyWithEditState extends CompanyData {
  isEditingNotes?: boolean;
  editedNotes?: string;
  showHistory?: boolean;
}

export default function PurchasePage() {
  const [companies, setCompanies] = useState<CompanyWithEditState[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(getTodayDate());
  const [searchName, setSearchName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  function getTodayDate() {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }

  async function handleFilter() {
    setIsLoading(true);

    try {
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;

      const result = await getCompanies(start, end, searchName);

      if (result.success) {
        setCompanies(
          result.data.map((company: CompanyData) => ({
            ...company,
            isEditingNotes: false,
            editedNotes: company.notes || "",
            showHistory: false,
          })),
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const formatDate = (date: string | Date) => {
    if (typeof date === "string") date = new Date(date);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const startEditingNotes = (companyId: string) => {
    setCompanies(
      companies.map((c) =>
        String(c._id) === companyId
          ? { ...c, isEditingNotes: true, editedNotes: c.notes || "" }
          : c,
      ),
    );
  };

  const cancelEditingNotes = (companyId: string) => {
    setCompanies(
      companies.map((c) =>
        String(c._id) === companyId
          ? { ...c, isEditingNotes: false, editedNotes: c.notes || "" }
          : c,
      ),
    );
  };

  const saveNotes = async (companyId: string, newNotes: string) => {
    setIsEditing(true);
    try {
      const response = await fetch(`/api/companies/${companyId}/notes`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes: newNotes }),
      });

      if (response.ok) {
        const data = await response.json();
        setCompanies(
          companies.map((c) =>
            String(c._id) === companyId
              ? {
                  ...c,
                  notes: data.notes,
                  isEditingNotes: false,
                  notesHistory: data.notesHistory,
                }
              : c,
          ),
        );
      } else {
        console.error("Failed to save notes");
      }
    } catch (err) {
      console.error("Failed to save notes:", err);
    }
    setIsEditing(false);
  };

  const toggleHistoryView = (companyId: string) => {
    setCompanies(
      companies.map((c) =>
        String(c._id) === companyId ? { ...c, showHistory: !c.showHistory } : c,
      ),
    );
  };

  return (
    <div className="mesh-bg min-h-screen flex flex-col">
      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-violet-400 uppercase">
              Purchase Management
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Search Companies
            </h1>
            <p className="mt-3 text-base text-white/40">
              Filter and search through all registered companies.
            </p>
          </div>

          {/* Filter Card */}
          <Card className="mb-8 border-white/[0.07] bg-white/3 shadow-none backdrop-blur-sm ring-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold tracking-tight text-white">
                Filter Companies
              </CardTitle>
              <CardDescription className="text-white/40">
                Use date range and company name to narrow your search
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Start Date */}
                <div className="">
                  <Label className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-white/50 uppercase mb-2">
                    <Calendar className="size-3 text-violet-400" />
                    From Date
                  </Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border-white/[0.07] bg-white/2 text-white placeholder:text-white/30 accent-violet-400 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>

                {/* End Date */}
                <div>
                  <Label className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-white/50 uppercase mb-2">
                    <Calendar className="size-3 text-violet-400" />
                    To Date
                  </Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border-white/[0.07] bg-white/2 text-white placeholder:text-white/30 accent-violet-400 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>

                {/* Search by Name */}
                <div>
                  <Label className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-white/50 uppercase mb-2">
                    <Search className="size-3 text-violet-400" />
                    Company Name
                  </Label>
                  <Input
                    type="text"
                    placeholder="Search..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleFilter();
                      }
                    }}
                    className="border-white/[0.07] bg-white/2 text-white placeholder:text-white/30"
                  />
                </div>

                {/* Search Button */}
                <div className="sm:col-span-2 lg:col-span-3 flex gap-2">
                  <Button
                    onClick={handleFilter}
                    disabled={isLoading}
                    className="bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    {isLoading ? "Searching..." : "Search"}
                  </Button>
                  <Button
                    onClick={() => {
                      setStartDate("");
                      setEndDate(getTodayDate());
                      setSearchName("");
                    }}
                    variant="outline"
                    className="border-white/[0.07] text-white hover:bg-white/5"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {companies.length > 0 ? (
            <div className="space-y-4">
              <div className="text-sm text-white/60">
                Showing{" "}
                <span className="font-semibold text-white">
                  {companies.length}
                </span>{" "}
                result
                {companies.length !== 1 ? "s" : ""}
              </div>

              <div className="grid gap-4">
                {companies.map((company) => (
                  <Card
                    key={String(company._id)}
                    className="border-white/[0.07] bg-white/2 shadow-none backdrop-blur-sm ring-0 hover:bg-white/4 transition-colors"
                  >
                    <CardContent className="pt-6">
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Company Name */}
                        <div>
                          <p className="text-xs font-semibold tracking-wide text-white/50 uppercase mb-1">
                            Company
                          </p>
                          <div className="flex items-center gap-2">
                            <Building2 className="size-4 text-violet-400" />
                            <p className="text-white font-mono">
                              {company.companyName}
                            </p>
                          </div>
                        </div>

                        {/* Phone */}
                        <div>
                          <p className="text-xs font-semibold tracking-wide text-white/50 uppercase mb-1">
                            Phone
                          </p>
                          <p className="text-white font-mono">
                            {company.phoneNumber}
                          </p>
                        </div>

                        {/* Purchase Person */}
                        <div>
                          <p className="text-xs font-semibold tracking-wide text-white/50 uppercase mb-1">
                            Purchase Person
                          </p>
                          <p className="text-white font-mono">
                            {company.purchasePerson}
                          </p>
                        </div>

                        {/* Notes */}
                        <div className="sm:col-span-2 lg:col-span-3">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-semibold tracking-wide text-white/50 uppercase">
                              Notes
                            </p>
                            <div className="flex gap-2">
                              {company.notesHistory &&
                                company.notesHistory.length > 0 && (
                                  <button
                                    onClick={() =>
                                      toggleHistoryView(String(company._id))
                                    }
                                    className="p-1 text-white/40 hover:text-violet-400 transition-colors"
                                    title="View notes history"
                                  >
                                    <History className="size-4" />
                                  </button>
                                )}
                              {!company.isEditingNotes && (
                                <button
                                  onClick={() =>
                                    startEditingNotes(String(company._id))
                                  }
                                  className="p-1 text-white/40 hover:text-violet-400 transition-colors"
                                  title="Edit notes"
                                >
                                  <Edit2 className="size-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          {company.isEditingNotes ? (
                            <div className="space-y-3">
                              <textarea
                                value={company.editedNotes || ""}
                                onChange={(e) =>
                                  setCompanies(
                                    companies.map((c) =>
                                      String(c._id) === String(company._id)
                                        ? { ...c, editedNotes: e.target.value }
                                        : c,
                                    ),
                                  )
                                }
                                className="w-full bg-white/5 text-white placeholder:text-white/30 border border-white/[0.07] rounded p-2 text-sm focus:outline-none focus:border-violet-400/50 resize-none"
                                rows={4}
                                placeholder="Add or edit notes..."
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={() =>
                                    saveNotes(
                                      String(company._id),
                                      company.editedNotes || "",
                                    )
                                  }
                                  className="bg-violet-600 hover:bg-violet-700 text-white flex items-center gap-1"
                                  size="sm"
                                >
                                  <Save className="size-3" />
                                  {isEditing ? "Saving..." : "Save"}
                                </Button>
                                <Button
                                  onClick={() =>
                                    cancelEditingNotes(String(company._id))
                                  }
                                  variant="outline"
                                  className="border-white/[0.07] text-white hover:bg-white/5"
                                  size="sm"
                                >
                                  <X className="size-3" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-white/70 text-sm">
                              {company.notes || (
                                <span className="text-white/40 italic">
                                  No notes
                                </span>
                              )}
                            </p>
                          )}

                          {/* Notes History */}
                          {company.showHistory &&
                            company.notesHistory &&
                            company.notesHistory.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-white/[0.07]">
                                <p className="text-xs font-semibold tracking-wide text-white/50 uppercase mb-3">
                                  Change History
                                </p>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                  {company.notesHistory.map((history, idx) => (
                                    <div
                                      key={idx}
                                      className="bg-white/2 p-3 rounded text-sm border border-white/5"
                                    >
                                      <p className="text-white/50 text-xs mb-1">
                                        {formatDate(history.changedAt)}
                                      </p>
                                      <p className="text-white/70">
                                        {history.notes || (
                                          <span className="italic">
                                            Empty notes
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>

                        {/* Date */}
                        <div className="sm:col-span-2 lg:col-span-3">
                          <p className="text-xs font-semibold tracking-wide text-white/50 uppercase mb-1">
                            Added On
                          </p>
                          <p className="text-white/60 text-sm font-mono">
                            {formatDate(company.createdAt)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card className="border-white/[0.07] bg-white/2 shadow-none backdrop-blur-sm ring-0">
              <CardContent className="pt-12 pb-12 text-center">
                <Building2 className="mx-auto size-12 text-white/20 mb-4" />
                <p className="text-white/60 mb-2">No companies found</p>
                <p className="text-white/40 text-sm">
                  Try adjusting your filters or add a new company first.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
