// lib/email-helper.ts
export interface EmailData {
  to: string;
  subject: string;
  body: string;
  attachments: File[];
}

export interface EmailAttachment {
  filename: string;
  content: string;
  contentType: string;
}

// Helper to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data:type;base64, prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = error => reject(error);
  });
};

// Helper to process attachments
const processAttachments = async (files: File[]): Promise<EmailAttachment[]> => {
  const attachments: EmailAttachment[] = [];
  
  for (const file of files) {
    try {
      const base64Content = await fileToBase64(file);
      attachments.push({
        filename: file.name,
        content: base64Content,
        contentType: file.type || 'application/octet-stream',
      });
    } catch (error) {
      console.error(`Failed to process attachment ${file.name}:`, error);
      throw new Error(`Failed to process attachment: ${file.name}`);
    }
  }
  
  return attachments;
};

// Main email sending helper
export const sendEmail = async (emailData: EmailData): Promise<{ success: boolean; message: string }> => {
  try {
    // Validate required fields
    if (!emailData.to.trim()) {
      return { success: false, message: 'Recipient email is required' };
    }
    
    if (!emailData.subject.trim()) {
      return { success: false, message: 'Subject is required' };
    }
    
    if (!emailData.body.trim()) {
      return { success: false, message: 'Email body is required' };
    }

    // Process attachments
    const attachments = await processAttachments(emailData.attachments);

    // Send email request
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: emailData.to.trim(),
        subject: emailData.subject.trim(),
        content: emailData.body.trim(),
        attachments,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        message: result.error || `Failed to send email: ${response.status}` 
      };
    }

    return { success: true, message: result.message || 'Email sent successfully' };

  } catch (error) {
    console.error('Email sending error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
};
