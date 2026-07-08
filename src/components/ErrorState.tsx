import { AlertCircle, Inbox, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = "Your feed is empty",
  description = "No videos match your current filters. Try adjusting settings or refreshing the feed.",
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border/60 bg-muted/30">
          <Inbox className="h-7 w-7 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="max-w-md text-sm text-muted-foreground">{description}</p>
        </div>
        {actionLabel && onAction ? (
          <Button onClick={onAction}>{actionLabel}</Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  resetLabel?: string;
  onReset?: () => void;
  offline?: boolean;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load your feed right now. Please try again.",
  onRetry,
  resetLabel,
  onReset,
  offline = false,
}: ErrorStateProps) {
  const Icon = offline ? WifiOff : AlertCircle;

  return (
    <Card className="border-destructive/20">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10">
          <Icon className="h-7 w-7 text-destructive" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="max-w-md text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {onRetry ? (
            <Button variant="outline" onClick={onRetry}>
              Try again
            </Button>
          ) : null}
          {resetLabel && onReset ? (
            <Button variant="secondary" onClick={onReset}>
              {resetLabel}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
