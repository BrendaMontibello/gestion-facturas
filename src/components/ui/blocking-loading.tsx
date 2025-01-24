"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useLoadingStore } from "@/lib/store/loading-store";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function BlockingLoading() {
  const { isLoading, message } = useLoadingStore();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isLoading) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    if (isLoading) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-0 bg-background backdrop-blur-sm z-50 pointer-events-none"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <Card className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight">
                {message}
              </h2>
              <p className="text-sm text-muted-foreground">
                Por favor, no cierre esta ventana...
              </p>
            </div>
            <Progress className="w-full" value={100} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
