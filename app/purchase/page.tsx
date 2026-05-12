"use client";

import { useState, useEffect } from "react";
import { Calendar, Search, Building2 } from "lucide-react";
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
import { SimpleHeader } from "@/components/ui/simple-header";
import { getCompanies } from "@/lib/actions/company";
import type { ICompany } from "@/lib/models/company";

export default function PurchasePage() {
  const [companies, setCompanies] = useState<ICompany[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(getTodayDate());
  const [searchName, setSearchName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
        setCompanies(result.data);
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
          <Card className="mb-8 border-white/[0.07] bg-white/[0.03] shadow-none backdrop-blur-sm ring-0">
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
                    className="border-white/[0.07] bg-white/[0.02] text-white placeholder:text-white/30 accent-violet-400 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:invert"
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
                    className="border-white/[0.07] bg-white/[0.02] text-white placeholder:text-white/30 accent-violet-400 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:invert"
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
                    className="border-white/[0.07] bg-white/[0.02] text-white placeholder:text-white/30"
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
                    className="border-white/[0.07] text-white hover:bg-white/[0.05]"
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
                    className="border-white/[0.07] bg-white/[0.02] shadow-none backdrop-blur-sm ring-0 hover:bg-white/[0.04] transition-colors"
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
                        {company.notes && (
                          <div className="sm:col-span-2 lg:col-span-3">
                            <p className="text-xs font-semibold tracking-wide text-white/50 uppercase mb-1">
                              Notes
                            </p>
                            <p className="text-white/70 text-sm">
                              {company.notes}
                            </p>
                          </div>
                        )}

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
            <Card className="border-white/[0.07] bg-white/[0.02] shadow-none backdrop-blur-sm ring-0">
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
