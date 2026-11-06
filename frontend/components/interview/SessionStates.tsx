import { ArrowRight, House, SearchX, WifiOff } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Skeleton } from "@/components/ui/Skeleton";
import { StateMessage } from "@/components/ui/StateMessage";
import { ApiError } from "@/services/api";

interface SessionErrorStateProps {
  error: Error;
  sessionId: string;
  onRetry: () => void;
}

/** Maps API failures for an interview session to a helpful message and next step. */
export function SessionErrorState({ error, sessionId, onRetry }: SessionErrorStateProps) {
  const status = error instanceof ApiError ? error.status : -1;

  if (status === 404) {
    return (
      <StateMessage
        icon={SearchX}
        title="Interview not found"
        description="This session doesn't exist, or it was cleared when the server restarted. Start a new one to keep practising."
        primaryAction={{ label: "Start a new interview", href: "/configure", icon: ArrowRight }}
        secondaryAction={{ label: "Home", href: "/", icon: House }}
      />
    );
  }

  if (status === 409) {
    return (
      <StateMessage
        title="This interview hasn't been submitted yet"
        description="Finish answering the questions and submit to see your results."
        primaryAction={{ label: "Continue interview", href: `/interview/${sessionId}`, icon: ArrowRight }}
      />
    );
  }

  return (
    <StateMessage
      icon={status === 0 ? WifiOff : undefined}
      title="Something went wrong"
      description={error.message}
      primaryAction={{ label: "Try again", onClick: onRetry }}
      secondaryAction={{ label: "Home", href: "/", icon: House }}
    />
  );
}

export function SessionSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy>
      <Skeleton className="h-16 rounded-full" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <GlassPanel tier="deck" className="flex flex-col gap-5 p-6 md:p-8 lg:col-span-8">
          <Skeleton className="h-5 w-1/2 rounded-full" />
          <Skeleton className="h-7 w-full" />
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-14 rounded-2xl" />
          ))}
        </GlassPanel>
        <GlassPanel tier="card" className="hidden flex-col gap-4 p-6 lg:col-span-4 lg:flex">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-32" />
        </GlassPanel>
      </div>
    </div>
  );
}
