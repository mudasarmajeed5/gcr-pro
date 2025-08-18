"use client"
import { useSession } from 'next-auth/react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, XCircle, Clock, BookOpen } from 'lucide-react'
import { ReactNode, useContext, createContext, useState } from 'react'

// Create context for loading state
const AssignmentsLayoutContext = createContext<{
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}>({
  isLoading: false,
  setIsLoading: () => {}
});

export const useAssignmentsLayout = () => useContext(AssignmentsLayoutContext);

interface AssignmentsLayoutProps {
  children: ReactNode;
}

const AssignmentsLayout = ({ children }: AssignmentsLayoutProps) => {
    const { status } = useSession();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const filter = searchParams.get('filter') || 'graded';
    const [isLoading, setIsLoading] = useState(false);

    const handleFilterChange = (newFilter: string) => {
        router.push(`/assignments?filter=${newFilter}`);
    }

    const showHeader = pathname === '/assignments';

    if (status === "loading" || status === "unauthenticated") {
        return <div>{children}</div>;
    }

    return (
        <AssignmentsLayoutContext.Provider value={{ isLoading, setIsLoading }}>
            <div className="container mx-auto p-6">
                {showHeader && (
                    <div className="mb-6">
                        <Tabs value={filter} onValueChange={handleFilterChange} className="w-full">
                            <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4">
                                <TabsTrigger 
                                    value="graded" 
                                    disabled={isLoading}
                                    className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="hidden sm:inline">Graded</span>
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="turnedIn"
                                    disabled={isLoading}
                                    className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <BookOpen className="h-4 w-4" />
                                    <span className="hidden sm:inline">Turned In</span>
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="unsubmitted"
                                    disabled={isLoading}
                                    className="data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Clock className="h-4 w-4" />
                                    <span className="hidden sm:inline">Pending</span>
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="missed"
                                    disabled={isLoading}
                                    className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <XCircle className="h-4 w-4" />
                                    <span className="hidden sm:inline">Missed</span>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                )}
                {children}
            </div>
        </AssignmentsLayoutContext.Provider>
    );
}

export default AssignmentsLayout