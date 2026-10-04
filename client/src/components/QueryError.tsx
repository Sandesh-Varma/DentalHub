import { Button } from "@/components/ui/button";

export function QueryError({ retry }: { retry: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-5">
      <h2 className="font-semibold text-slate-900">We couldn’t load this information</h2>
      <p className="mt-1 text-sm text-slate-600">Check your connection and try again. The demo server may take a moment to wake up.</p>
      <Button className="mt-3" variant="outline" onClick={retry}>Try again</Button>
    </div>
  );
}
