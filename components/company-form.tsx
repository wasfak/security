"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  LoaderCircle,
  Building2,
  Phone,
  User,
  FileText,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { saveCompany, type CompanyFormData } from "@/lib/actions/company";

const PERSON_LIST = [
  "Wasfy",
  "Nabil",
  "Yasmin",
  "Aya",
  "Wafaa",
  "Essam",
  "Hamouda",
  "Zaghlol",
];

const INITIAL_STATE: CompanyFormData = {
  companyName: "",
  phoneNumber: "",
  purchasePerson: "",
  notes: "",
};

export default function CompanyForm() {
  const [form, setForm] = useState<CompanyFormData>(INITIAL_STATE);
  const [isPending, setIsPending] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handlePersonSelect(person: string) {
    setForm((prev) => ({ ...prev, purchasePerson: person }));
    setOpenDropdown(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);

    try {
      const result = await saveCompany(form);

      if (result.success) {
        toast.success("Entry saved!", {
          description: `${form.companyName} has been added successfully.`,
        });
        setForm(INITIAL_STATE);
      } else {
        toast.error("Save failed", {
          description: result.error,
        });
      }
    } catch {
      toast.error("Unexpected error", {
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card className="w-full border-white/[0.07] bg-white/[0.03] shadow-none backdrop-blur-sm ring-0">
      <CardHeader className="pb-6">
        <CardTitle className="text-xl font-semibold tracking-tight text-white">
          New Company Entry
        </CardTitle>
        <CardDescription className="text-white/40">
          Fill in the details below to add a new purchase contact.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="companyName"
              className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-white/50 uppercase"
            >
              <Building2 className="size-3" />
              Company Name
            </Label>
            <Input
              id="companyName"
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              placeholder="Acme Corporation"
              required
              disabled={isPending}
              className="h-11 border-white/[0.08] bg-white/[0.05] text-white placeholder:text-white/20 focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="phoneNumber"
              className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-white/50 uppercase"
            >
              <Phone className="size-3" />
              Phone Number
            </Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={form.phoneNumber}
              onChange={handleChange}
              placeholder="01112584545"
              required
              disabled={isPending}
              className="h-11  placeholder:text-white/20 focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-white/50 uppercase">
              <User className="size-3" />
              Purchase Person
            </Label>
            <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  disabled={isPending}
                  className="h-11 w-full justify-between border-white/[0.08] bg-white/[0.05] text-white hover:bg-white/[0.08] hover:text-white"
                >
                  {form.purchasePerson || "Select a person"}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-black">
                {PERSON_LIST.map((person) => (
                  <DropdownMenuItem
                    key={person}
                    onClick={() => handlePersonSelect(person)}
                    className="cursor-pointer text-violet-400"
                  >
                    {person}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="notes"
              className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-white/50 uppercase"
            >
              <FileText className="size-3" />
              Notes
              <span className="ml-1 text-[10px] font-normal normal-case text-white/25">
                optional
              </span>
            </Label>
            <Textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Any relevant details about this purchase contact..."
              rows={4}
              disabled={isPending}
              className="resize-none border-white/[0.08] bg-white/[0.05] text-white placeholder:text-white/20 focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isPending}
            className="mt-2 w-full gap-2 h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border-0 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/35 transition-all duration-200"
          >
            {isPending ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Entry"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
