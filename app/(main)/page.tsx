import AssignmentsOverview from "./features/overview/AssignmentsOverview";
export default async function Home() {
  return (
    <div className="container mx-auto h-full border">
      <AssignmentsOverview />
    </div>
  );
}
