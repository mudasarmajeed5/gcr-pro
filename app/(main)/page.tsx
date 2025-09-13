"use client"

import { useSession } from "next-auth/react";
import AssignmentsOverview from "./features/overview/AssignmentsOverview";
import RecentActivity from "./features/overview/RecentActivity";
import LandingPage from "./features/landing/landing-page"; // You'll need to create this component

export default function Home() {
  const { data: session, status } = useSession();

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  if (!session) {
    return <LandingPage />;
  }

  // Show dashboard for authenticated users
  return (
    <div className="container mx-auto h-full border">
      <AssignmentsOverview />
      <RecentActivity />
    </div>
  );
}