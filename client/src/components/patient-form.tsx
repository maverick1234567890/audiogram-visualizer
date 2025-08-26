import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { PatientData } from '@/hooks/use-audiogram-state';

interface PatientFormProps {
  patientData: PatientData;
  onUpdatePatientData: (field: keyof PatientData, value: string) => void;
  validationErrors?: string[];
}

export function PatientForm({ patientData, onUpdatePatientData, validationErrors }: PatientFormProps) {
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set());

  const hasErrors = validationErrors && validationErrors.length > 0;

  // Update field errors when validation changes
  React.useEffect(() => {
    if (validationErrors) {
      const errors = new Set<string>();
      validationErrors.forEach(error => {
        if (error.includes('Patient Name')) errors.add('name');
        if (error.includes('Date of Examination')) errors.add('examDate');
        if (error.includes('Birth Date')) errors.add('birthDate');
      });
      setFieldErrors(errors);
    } else {
      setFieldErrors(new Set());
    }
  }, [validationErrors]);

  return (
    <Card className="mb-8" data-testid="patient-form">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Patient Information</CardTitle>
        
        {hasErrors && (
          <Alert variant="destructive" data-testid="validation-error">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please fill in all required fields before exporting.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <Label 
              htmlFor="patient-name" 
              className={fieldErrors.has('name') ? 'error-label' : ''}
            >
              Patient's Name <span className="text-red-500" aria-hidden="true">*</span>
            </Label>
            <Input
              id="patient-name"
              data-testid="input-patient-name"
              required
              value={patientData.name}
              onChange={(e) => onUpdatePatientData('name', e.target.value)}
              placeholder="Enter patient's full name"
              className={fieldErrors.has('name') ? 'error-input' : ''}
            />
          </div>
          
          <div className="flex-1 space-y-2">
            <Label 
              htmlFor="exam-date"
              className={fieldErrors.has('examDate') ? 'error-label' : ''}
            >
              Date of Examination <span className="text-red-500" aria-hidden="true">*</span>
            </Label>
            <Input
              id="exam-date"
              data-testid="input-exam-date"
              required
              value={patientData.examDate}
              onChange={(e) => onUpdatePatientData('examDate', e.target.value)}
              placeholder="DD/MM/YYYY"
              className={fieldErrors.has('examDate') ? 'error-input' : ''}
            />
          </div>
          
          <div className="flex-1 space-y-2">
            <Label 
              htmlFor="birth-date"
              className={fieldErrors.has('birthDate') ? 'error-label' : ''}
            >
              Birth Date <span className="text-red-500" aria-hidden="true">*</span>
            </Label>
            <Input
              id="birth-date"
              data-testid="input-birth-date"
              required
              value={patientData.birthDate}
              onChange={(e) => onUpdatePatientData('birthDate', e.target.value)}
              placeholder="DD/MM/YYYY"
              className={fieldErrors.has('birthDate') ? 'error-input' : ''}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
