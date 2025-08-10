// 📄 FieldEditor.tsx
// Allows editing of label and default value of a form field

import React from 'react';
import { TextField, Box } from '@mui/material';
import { useDispatch } from 'react-redux';
import type { FormField } from '../types/formTypes';
import { updateField } from '../redux/formSlice';

interface Props {
  field: FormField;
}

const FieldEditor: React.FC<Props> = ({ field }) => {
  const dispatch = useDispatch();

  const handleChange = (key: keyof FormField, value: string) => {
    dispatch(updateField({ ...field, [key]: value }));
  };

  return (
    <Box display="flex" flexDirection="column" my={2} gap={1}>
      <TextField
        label="Label"
        value={field.label}
        onChange={(e) => handleChange('label', e.target.value)}
      />
      <TextField
        label="Default Value"
        value={field.defaultValue}
        onChange={(e) => handleChange('defaultValue', e.target.value)}
      />
    </Box>
  );
};

export default FieldEditor;
