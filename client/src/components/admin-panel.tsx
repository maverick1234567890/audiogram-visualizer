import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Settings, Eye, EyeOff, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AdminPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleMasterPasswordSubmit = async () => {
    setIsLoading(true);
    
    // Simulate checking delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (masterPassword === 'Konijntje123') {
      setIsAuthenticated(true);
      toast({
        title: "Admin Access Granted",
        description: "You can now change the website password.",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect master password.",
        variant: "destructive",
      });
      setMasterPassword('');
    }
    
    setIsLoading(false);
  };

  const handlePasswordChange = async () => {
    if (!newPassword.trim()) {
      toast({
        title: "Error",
        description: "New password cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate password update delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Store new password in localStorage for persistence
    localStorage.setItem('website_password', newPassword);
    
    toast({
      title: "Password Updated",
      description: "Website password has been successfully changed.",
    });
    
    // Reset form
    setNewPassword('');
    setIsAuthenticated(false);
    setMasterPassword('');
    setIsOpen(false);
    setIsLoading(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsAuthenticated(false);
    setMasterPassword('');
    setNewPassword('');
    setShowPasswords(false);
  };

  return (
    <>
      {/* Hidden admin icon in bottom right corner */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0 opacity-20 hover:opacity-60 transition-opacity duration-300"
          onClick={() => setIsOpen(true)}
          data-testid="admin-panel-trigger"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Admin Panel Dialog */}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md" data-testid="admin-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Admin Panel
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {!isAuthenticated ? (
              /* Master Password Input */
              <div className="space-y-3">
                <Label htmlFor="master-password">Master Password</Label>
                <div className="relative">
                  <Input
                    id="master-password"
                    type={showPasswords ? "text" : "password"}
                    value={masterPassword}
                    onChange={(e) => setMasterPassword(e.target.value)}
                    placeholder="Enter master password"
                    className="pr-10"
                    disabled={isLoading}
                    data-testid="master-password-input"
                    onKeyPress={(e) => e.key === 'Enter' && handleMasterPasswordSubmit()}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords(!showPasswords)}
                    data-testid="toggle-master-password-visibility"
                  >
                    {showPasswords ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleMasterPasswordSubmit}
                    disabled={!masterPassword.trim() || isLoading}
                    className="flex-1"
                    data-testid="verify-master-password"
                  >
                    {isLoading ? 'Verifying...' : 'Verify'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    data-testid="cancel-admin-access"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              /* Password Change Form */
              <div className="space-y-3">
                <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Admin access granted
                </div>
                
                <Label htmlFor="new-password">New Website Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPasswords ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="pr-10"
                    disabled={isLoading}
                    data-testid="new-password-input"
                    onKeyPress={(e) => e.key === 'Enter' && handlePasswordChange()}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPasswords(!showPasswords)}
                    data-testid="toggle-new-password-visibility"
                  >
                    {showPasswords ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handlePasswordChange}
                    disabled={!newPassword.trim() || isLoading}
                    className="flex-1"
                    data-testid="update-password"
                  >
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    data-testid="close-admin-panel"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}