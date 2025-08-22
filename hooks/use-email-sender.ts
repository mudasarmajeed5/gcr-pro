import { EmailData, sendEmail } from "@/lib/email-helper";
import { useState } from "react";

export const useEmailSender = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSendEmail = async (
    emailData: EmailData,
    onSuccess?: () => void,
    onError?: (message: string) => void
  ) => {
    setIsLoading(true);
    
    try {
      const result = await sendEmail(emailData);
      
      if (result.success) {
        onSuccess?.();
        console.log('Email sent successfully');
      } else {
        onError?.(result.message);
        console.error('Email sending failed:', result.message);
      }
      
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  return { handleSendEmail, isLoading };
};