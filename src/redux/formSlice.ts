import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { FormField, FormSchema } from '../types/formTypes';

interface FormState {
  formName: string;
  fields: FormField[];
}

const initialState: FormState = {
  formName: '',
  fields: [],
};

const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    setFormName(state, action: PayloadAction<string>) {
      state.formName = action.payload;
    },
    addField(state, action: PayloadAction<FormField>) {
      state.fields.push(action.payload);
    },
    updateField(state, action: PayloadAction<FormField>) {
      const index = state.fields.findIndex(f => f.id === action.payload.id);
      if (index !== -1) state.fields[index] = action.payload;
    },
    deleteField(state, action: PayloadAction<string>) {
      state.fields = state.fields.filter(f => f.id !== action.payload);
    },
    reorderFields(state, action: PayloadAction<FormField[]>) {
      state.fields = action.payload;
    },
    resetForm(state) {
      state.formName = '';
      state.fields = [];
    },
    // ✅ New reducer to load a full form into Redux
    setForm(state, action: PayloadAction<FormSchema>) {
      state.formName = action.payload.name;
      state.fields = action.payload.fields;
    },
  },
});

export const {
  setFormName,
  addField,
  updateField,
  deleteField,
  reorderFields,
  resetForm,
  setForm, // ✅ export the new action
} = formSlice.actions;

export default formSlice.reducer;
