import { useEffect, useState } from "react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowOffline(true);
    } else {
      // Delay hiding to show "back online" message
      const timer = setTimeout(() => setShowOffline(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!showOffline) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Alert variant={isOnline ? "success" : "warning"}>
        <AlertDescription>
          {isOnline
            ? "You're back online"
            : "You're offline. Some features may not work."}
        </AlertDescription>
      </Alert>
    </div>
  );
}
