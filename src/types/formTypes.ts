export type FieldType = 'text' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'password';

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  email?: boolean;
  passwordRule?: boolean;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  defaultValue?: string;
  options?: string[];
  validation?: ValidationRules;
  derived?: boolean;
  parentFields?: string[];
  formula?: string;
}

export interface FormSchema {
  id: string;
  name: string;
  createdAt: string;
  fields: FormField[];
}
