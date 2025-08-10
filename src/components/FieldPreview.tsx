// 📄 FieldPreview.tsx
// Displays a single input field (used optionally for testing/preview)

import React from 'react';
import { TextField } from '@mui/material';
import { FormField } from '../types/formTypes';

interface Props {
  field: FormField;
}

const FieldPreview: React.FC<Props> = ({ field }) => {
  return (
    <TextField
      label={field.label || field.type}
      type={field.type === 'number' ? 'number' : 'text'}
      defaultValue={field.defaultValue}
      fullWidth
    />
  );
};

export default FieldPreview;
