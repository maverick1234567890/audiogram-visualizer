import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { AudiogramChart } from './audiogram-chart';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle } from 'lucide-react';
import { EarData, EditingMode } from '@/hooks/use-audiogram-state';

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  ear: 'right' | 'left' | null;
  data: { right: EarData; left: EarData };
  editingMode: EditingMode;
  onUpdateThreshold: (ear: 'right' | 'left', conduction: 'air' | 'bone', frequency: number, value: number) => void;
  onSetEditingMode: (ear: 'right' | 'left', conduction: 'air' | 'bone') => void;
}

export function ChartModal({ 
  isOpen, 
  onClose, 
  ear, 
  data, 
  editingMode, 
  onUpdateThreshold,
  onSetEditingMode
}: ChartModalProps) {
  const [showBetaWarning, setShowBetaWarning] = useState(false);
  
  // Show beta warning when modal opens
  useEffect(() => {
    if (isOpen && ear) {
      setShowBetaWarning(true);
      const timer = setTimeout(() => setShowBetaWarning(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, ear]);
  
  if (!ear) return null;

  const title = ear === 'right' ? 'Right Ear Audiogram' : 'Left Ear Audiogram';

  const handleEditingChange = (value: string) => {
    if (ear) {
      onSetEditingMode(ear, value as 'air' | 'bone');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="w-[95vw] h-[95vh] max-w-none max-h-none overflow-hidden bg-white dark:bg-gray-900 border shadow-2xl p-6"
        data-testid="chart-modal"
      >
        <VisuallyHidden>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Interactive audiogram chart</DialogDescription>
        </VisuallyHidden>
        
        {/* Close Button - Top Right */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-20 h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={onClose}
          data-testid="close-modal"
        >
          <X className="h-4 w-4" />
        </Button>
        
        {/* Beta Warning */}
        {showBetaWarning && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 shadow-lg flex items-center gap-2 max-w-md">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Beta Feature:</strong> Enlarged view might not work properly. We recommend using the normal view.
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 ml-2 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400"
                onClick={() => setShowBetaWarning(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Editing Controls - Top Right */}
        <div className="absolute top-12 right-4 z-10">
          <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-md shadow-sm border">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Edit:</div>
            <RadioGroup
              value={ear ? editingMode[ear] : 'air'}
              onValueChange={handleEditingChange}
              className="flex items-center gap-3"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem 
                  value="air" 
                  id={`modal-${ear}-air`}
                  className={ear === 'right' ? 'text-medical-red' : 'text-medical-blue'}
                />
                <Label htmlFor={`modal-${ear}-air`} className="cursor-pointer text-sm">Air</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem 
                  value="bone" 
                  id={`modal-${ear}-bone`}
                  className={ear === 'right' ? 'text-medical-red' : 'text-medical-blue'}
                />
                <Label htmlFor={`modal-${ear}-bone`} className="cursor-pointer text-sm">Bone</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        {/* Full-size Chart */}
        <div className="w-full h-full">
          <AudiogramChart
            ear={ear}
            data={data[ear]}
            editingMode={editingMode}
            onUpdateThreshold={onUpdateThreshold}
            onEnlarge={() => {}} // No enlarge in modal
            className="w-full h-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
