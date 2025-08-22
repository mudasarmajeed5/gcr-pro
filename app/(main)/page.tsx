import AssignmentsOverview from "./features/overview/AssignmentsOverview";
import { auth } from "@/auth";
export default async function Home() {
  return (
    <div className="container mx-auto h-full border">
      <AssignmentsOverview />
    </div>
  );
}
