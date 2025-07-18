
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EmailSharingInputProps {
  sharedEmails: string[];
  onEmailsChange: (emails: string[]) => void;
  isSubscribed: boolean;
  onSave?: () => Promise<void>;
  disabled?: boolean;
}

const EmailSharingInput = ({ sharedEmails, onEmailsChange, isSubscribed, onSave, disabled = false }: EmailSharingInputProps) => {
  const [currentEmail, setCurrentEmail] = useState('');

  const addEmail = () => {
    const email = currentEmail.trim();
    if (!email) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (sharedEmails.includes(email)) {
      toast({
        title: "Email Already Added",
        description: "This email is already in the sharing list.",
        variant: "destructive",
      });
      return;
    }

    if (sharedEmails.length >= 5) {
      toast({
        title: "Maximum Reached",
        description: "You can share with up to 5 people maximum.",
        variant: "destructive",
      });
      return;
    }

    onEmailsChange([...sharedEmails, email]);
    setCurrentEmail('');
  };

  const removeEmail = (emailToRemove: string) => {
    onEmailsChange(sharedEmails.filter(email => email !== emailToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addEmail();
    }
  };

  return (
    <div>
      <Label htmlFor="email-sharing" className="text-black">
        Share with Emails {!isSubscribed && <span className="text-sm text-gray-500">(Premium Feature)</span>}
      </Label>
      
      <div className="mt-1 space-y-2">
        <div className="flex gap-2">
          <Input
            id="email-sharing"
            type="email"
            value={currentEmail}
            onChange={(e) => setCurrentEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isSubscribed ? "Enter email address" : "Upgrade to Premium to share projects"}
            disabled={!isSubscribed}
          />
          <Button
            type="button"
            onClick={addEmail}
            disabled={!isSubscribed || !currentEmail.trim()}
            size="sm"
            className="bg-black text-white hover:bg-gray-800"
          >
            <Plus size={16} />
          </Button>
        </div>

        {sharedEmails.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Shared with:</p>
            {sharedEmails.map((email, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-sm">{email}</span>
                <Button
                  type="button"
                  onClick={() => removeEmail(email)}
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                >
                  <X size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}

        {!isSubscribed && (
          <p className="text-sm text-gray-500">
            Upgrade to Premium to share projects with others
          </p>
        )}
      </div>
    </div>
  );
};

export default EmailSharingInput;
