import type { FormSchema } from '../types/formTypes';

const FORM_KEY = 'savedForms';

// ✅ Save form with auto-generated ID and createdAt if missing
export const saveForm = (form: FormSchema) => {
  const forms = getSavedForms();

  const newForm: FormSchema = {
    ...form,
    id: form.id || Date.now().toString(), // generate unique ID if missing
    createdAt: form.createdAt || new Date().toISOString(), // store ISO date
  };

  forms.push(newForm);
  localStorage.setItem(FORM_KEY, JSON.stringify(forms));
};

// ✅ Get all saved forms
export const getSavedForms = (): FormSchema[] => {
  const data = localStorage.getItem(FORM_KEY);
  return data ? JSON.parse(data) : [];
};

// ✅ Get a single form by ID
export const getFormById = (id: string): FormSchema | undefined => {
  return getSavedForms().find((form) => form.id === id);
};

// ✅ Delete a form by ID
export const deleteFormById = (id: string) => {
  const updatedForms = getSavedForms().filter((form) => form.id !== id);
  localStorage.setItem(FORM_KEY, JSON.stringify(updatedForms));
};

// ✅ Clear all forms
export const clearAllForms = () => {
  localStorage.removeItem(FORM_KEY);
};
