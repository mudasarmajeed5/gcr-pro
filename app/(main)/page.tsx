import AssignmentsOverview from "./features/overview/AssignmentsOverview";
import RecentActivity from "./features/overview/RecentActivity";
export default async function Home() {
  return (
    <div className="container mx-auto h-full border">
      <AssignmentsOverview />
      <RecentActivity/>
    </div>
  );
}
