// 📄 FormRenderer.tsx
// Renders the full form using MUI based on the schema

import React from 'react';
import { Box, TextField } from '@mui/material';
import type { FormField } from '../types/formTypes';

interface Props {
  fields: FormField[];
}

const FormRenderer: React.FC<Props> = ({ fields }) => {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {fields.map((field) => (
        <TextField
          key={field.id}
          label={field.label || field.type}
          required={field.validation?.required}
          type={field.type === 'number' ? 'number' : 'text'}
          defaultValue={field.defaultValue}
          fullWidth
        />
      ))}
    </Box>
  );
};

export default FormRenderer;
