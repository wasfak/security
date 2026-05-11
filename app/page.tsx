
import CompanyForm from "@/components/company-form";


export default function Home() {
  return (
    <div className="mesh-bg flex min-h-screen flex-col">
      

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          <div className="mb-10 text-center">
            <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-violet-400 uppercase">
              Purchase Management
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Add a Contact
            </h1>
            <p className="mt-4 text-base text-white/40">
              Record your new company purchase contact information.
            </p>
          </div>

          <CompanyForm />
        </div>
      </main>
    </div>
  );
}
