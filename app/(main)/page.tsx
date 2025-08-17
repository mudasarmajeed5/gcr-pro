import CoursesList from "./features/courses/CourseList";
import AssignmentsOverview from "./features/overview/AssignmentsOverview";

export default function Home() {

  return (
    <div className="container mx-auto">
      <AssignmentsOverview/>
      <CoursesList />
    </div>
  );
}
