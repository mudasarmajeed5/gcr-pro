import { AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface AlertTriangleGlobalProps {
  message?: string;
}

export default function AlertTriangleGlobal({
  message = "404, Not Found",
}: AlertTriangleGlobalProps) {
  return (
    <Card className="max-w-2xl w-full mx-auto text-center py-8">
      <CardHeader>
        <div className="flex flex-col items-center gap-4">
          <AlertTriangle className="w-12 h-12 text-destructive animate-pulse" />
          <CardTitle className="text-xl font-semibold">{message}</CardTitle>
        </div>
      </CardHeader>
    </Card>
  );
}
