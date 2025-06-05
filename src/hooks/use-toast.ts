import { toast as sonnerToast } from "sonner";

// For compatibility: useToast throws an error to guide devs to use Sonner's toast directly
function useToast() {
  throw new Error(
    "useToast is deprecated. Please use the 'toast' export from 'sonner' directly."
  );
}

export { useToast, sonnerToast as toast };
