import { DashboardLayout } from "@/components/layout/dashboard-layout";
import SpecForm from "@/components/SpecForm";

export default function ClientSpecsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto mt-8">
        <SpecForm onSubmit={() => {}} />
      </div>
    </DashboardLayout>
  );
} 