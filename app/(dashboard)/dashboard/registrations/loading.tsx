import {
  SectionHeaderSkeleton,
  StatStripSkeleton,
  DataTableSkeleton,
} from "@/components/ui/skeleton";

export default function RegistrationsLoading() {
  return (
    <div className="space-y-6">
      <SectionHeaderSkeleton />
      <StatStripSkeleton />
      <DataTableSkeleton rows={8} />
    </div>
  );
}
