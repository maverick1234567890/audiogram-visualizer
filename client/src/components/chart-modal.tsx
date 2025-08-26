import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AudiogramChart } from './audiogram-chart';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
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
  if (!ear) return null;

  const title = ear === 'right' ? 'Right Ear Audiogram' : 'Left Ear Audiogram';

  const handleEditingChange = (value: string) => {
    if (ear) {
      onSetEditingMode(ear, value as 'air' | 'bone');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[98vw] h-[98vh] max-w-none max-h-none overflow-hidden p-3" data-testid="chart-modal">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Interactive audiogram chart - click to edit thresholds
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 h-[calc(98vh-120px)]">
          {/* Editing Controls */}
          <div className="flex items-center justify-center">
            <fieldset className="flex items-center gap-4">
              <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
                {title} Editing:
              </legend>
              <RadioGroup
                value={ear ? editingMode[ear] : 'air'}
                onValueChange={handleEditingChange}
                className="flex items-center gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="air" 
                    id={`modal-${ear}-air`}
                    className={ear === 'right' ? 'text-medical-red' : 'text-medical-blue'}
                  />
                  <Label htmlFor={`modal-${ear}-air`} className="cursor-pointer">Air</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="bone" 
                    id={`modal-${ear}-bone`}
                    className={ear === 'right' ? 'text-medical-red' : 'text-medical-blue'}
                  />
                  <Label htmlFor={`modal-${ear}-bone`} className="cursor-pointer">Bone</Label>
                </div>
              </RadioGroup>
            </fieldset>
          </div>
          
          {/* Chart */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <AudiogramChart
              ear={ear}
              data={data[ear]}
              editingMode={editingMode}
              onUpdateThreshold={onUpdateThreshold}
              onEnlarge={() => {}} // No enlarge in modal
              className="h-full w-full"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
