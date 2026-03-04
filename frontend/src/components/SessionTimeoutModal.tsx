import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Clock, Shield } from 'lucide-react';

interface SessionTimeoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStayLoggedIn: () => void;
  onTimeout: () => void;
  remainingSeconds: number;
}

export default function SessionTimeoutModal({
  isOpen,
  onClose,
  onStayLoggedIn,
  onTimeout,
  remainingSeconds,
}: SessionTimeoutModalProps) {
  const [seconds, setSeconds] = useState(remainingSeconds);

  // Reset seconds when modal opens or remainingSeconds changes
  useEffect(() => {
    if (isOpen) {
      setSeconds(remainingSeconds);
    }
  }, [isOpen, remainingSeconds]);

  // Handle countdown
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onClose();
          onTimeout(); // Trigger logout when countdown finishes
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onClose, onTimeout]);

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
            </div>
            <AlertDialogTitle className="text-xl">
              Session Timeout Warning
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base space-y-3">
            <p className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Your session is about to expire due to inactivity.
            </p>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-center text-sm text-muted-foreground mb-2">
                Time remaining
              </p>
              <p className="text-center text-3xl font-bold text-foreground">
                {seconds}s
              </p>
            </div>
            <p className="text-sm">
              To protect your account security, you'll be automatically logged out
              if no activity is detected. Click "Stay Logged In" to continue your session.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={onStayLoggedIn}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Stay Logged In
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
