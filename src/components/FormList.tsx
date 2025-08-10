// 📄 FormList.tsx
// (Reusable component, currently not used directly)

import React from 'react';
import { getSavedForms } from '../utils/localStorage';
import { List, ListItem, ListItemText } from '@mui/material';

const FormList = () => {
  const forms = getSavedForms();
  return (
    <List>
      {forms.map((form, idx) => (
        <ListItem key={idx}>
          <ListItemText primary={form.name} secondary={form.createdAt} />
        </ListItem>
      ))}
    </List>
  );
};

export default FormList;
