/* eslint-disable @typescript-eslint/no-explicit-any */
// 📄 PreviewFormPage.tsx
// Fully animated, responsive, and aesthetically styled form preview page.
// Uses Material UI for styling and Framer Motion for smooth animations.

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import type { RootState } from "../redux/store";
import { getFormById } from "../utils/localStorage";
import { setForm } from "../redux/formSlice"; 
import {
  Typography,
  Box,
  Paper,
  TextField,
  MenuItem,
  RadioGroup,
  Radio,
  FormControlLabel,
  Checkbox,
  Button,
  InputAdornment,
  IconButton,
  FormControl,
  FormLabel,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion"; // 🔹 Animation library
import { Visibility, VisibilityOff } from "@mui/icons-material";

interface ValidationErrors {
  [key: string]: string;
}

const PreviewFormPage = () => {
  const { id } = useParams<{ id?: string }>();
  const dispatch = useDispatch();
  const { fields, formName } = useSelector((state: RootState) => state.form);

  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Password visibility toggle state per field ID
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (fieldId: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [fieldId]: !prev[fieldId],
    }));
  };

  // 🔹 Load form from localStorage if accessed via /preview/:id
  useEffect(() => {
    if (id) {
      const savedForm = getFormById(id);
      if (savedForm) {
        dispatch(setForm(savedForm));
      }
    }
  }, [id, dispatch]);

  // 🔹 Automatically update "derived fields" like full name or age
  useEffect(() => {
    const updatedData = { ...formData };
    let changed = false;

    fields.forEach((field) => {
      if (field.derived && Array.isArray(field.derived.parentFields)) {
        const parentValues = field.derived.parentFields.map(
          (pid: string) => updatedData[pid] || ""
        );

        if (field.derived.formula === "ageFromDOB" && parentValues[0]) {
          const dob = new Date(parentValues[0]);
          if (!isNaN(dob.getTime())) {
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const m = today.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
              age--;
            }
            updatedData[field.id] = age;
            changed = true;
          }
        }

        if (field.derived.formula === "fullName" && parentValues.length === 2) {
          updatedData[field.id] = `${parentValues[0]} ${parentValues[1]}`.trim();
          changed = true;
        }
      }
    });

    if (changed) setFormData(updatedData);
  }, [formData, fields]);

  // 🔹 Handle field value changes & validate instantly
  const handleChange = (id: string, value: any) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
    validateField(id, value);
  };

  // 🔹 Basic validation rules
  const validateField = (id: string, value: any) => {
    const field = fields.find((f) => f.id === id);
    if (!field) return;

    let error = "";
    if (field.validation?.required && (value === undefined || value === null || value.length === 0)) 
      error = "This field is required.";
    if (field.validation?.minLength && value?.length < field.validation.minLength)
      error = `Minimum length is ${field.validation.minLength}.`;
    if (field.validation?.maxLength && value?.length > field.validation.maxLength)
      error = `Maximum length is ${field.validation.maxLength}.`;
    if (field.validation?.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      error = "Invalid email format.";
    if (field.validation?.password) {
      const hasNumber = /\d/;
      if (value.length < 6 || !hasNumber.test(value))
        error = "Password must be at least 6 characters & contain a number.";
    }

    setErrors((prev) => ({ ...prev, [id]: error }));
  };

  // 🔹 On form submit — just validate (no backend call here)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasErrors = false;
    const newErrors: ValidationErrors = {};

    fields.forEach((f) => {
      validateField(f.id, formData[f.id]);
      if (
        (formData[f.id] === undefined ||
         formData[f.id] === null ||
         (typeof formData[f.id] === "string" && formData[f.id].trim() === "") ||
         (Array.isArray(formData[f.id]) && formData[f.id].length === 0)) &&
        f.validation?.required
      ) {
        newErrors[f.id] = "This field is required.";
        hasErrors = true;
      }
    });

    setErrors((prev) => ({ ...prev, ...newErrors }));

    if (!hasErrors) {
      alert("✅ All validations passed! (Preview only)");
    }
  };

  // 🔹 Dynamically render fields based on type
  const renderField = (field: any) => {
    const commonProps = {
      key: field.id,
      label: field.label,
      value: formData[field.id] || "",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        handleChange(field.id, e.target.value),
      onBlur: (e: React.FocusEvent<HTMLInputElement>) =>
        validateField(field.id, e.target.value),
      error: Boolean(errors[field.id]),
      helperText: errors[field.id] || " ",
      fullWidth: true,
      required: field.validation?.required || false,
    };

    if (field.derived) {
      return (
        <TextField
          {...commonProps}
          value={formData[field.id] || ""}
          InputProps={{ readOnly: true }}
        />
      );
    }

    switch (field.type) {
      case "text":
      case "number":
        return <TextField {...commonProps} type={field.type} />;

      case "password":
        return (
          <TextField
            {...commonProps}
            type={showPasswords[field.id] ? "text" : "password"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => togglePasswordVisibility(field.id)}
                    edge="end"
                    aria-label="toggle password visibility"
                  >
                    {showPasswords[field.id] ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        );

      case "date":
        return (
          <TextField
            {...commonProps}
            type="date"
            InputLabelProps={{ shrink: true }}
          />
        );

      case "textarea":
        return <TextField {...commonProps} multiline rows={3} />;

      case "select":
        return (
          <TextField {...commonProps} select>
            {Array.isArray(field.options) &&
              field.options.map((opt: string, idx: number) => (
                <MenuItem key={idx} value={opt}>
                  {opt}
                </MenuItem>
              ))}
          </TextField>
        );

      case "radio":
        return (
          <FormControl
            key={field.id}
            component="fieldset"
            error={Boolean(errors[field.id])}
            required={field.validation?.required || false}
            fullWidth
          >
            <FormLabel component="legend">{field.label}</FormLabel>
            <RadioGroup
              aria-label={field.label}
              name={field.id}
              value={formData[field.id] || ""}
              onChange={(e) => handleChange(field.id, e.target.value)}
            >
              {Array.isArray(field.options) &&
                field.options.map((opt: string, idx: number) => (
                  <FormControlLabel
                    key={idx}
                    value={opt}
                    control={<Radio />}
                    label={opt}
                  />
                ))}
            </RadioGroup>
            {errors[field.id] && (
              <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                {errors[field.id]}
              </Typography>
            )}
          </FormControl>
        );

      case "checkbox":
        return (
          <FormControl
            key={field.id}
            component="fieldset"
            error={Boolean(errors[field.id])}
            required={field.validation?.required || false}
            fullWidth
          >
            <FormLabel component="legend">{field.label}</FormLabel>
            {Array.isArray(field.options) &&
              field.options.map((opt: string, idx: number) => {
                const checkedArray = Array.isArray(formData[field.id])
                  ? formData[field.id]
                  : [];
                const isChecked = checkedArray.includes(opt);

                const handleCheckboxChange = (checked: boolean) => {
                  let updatedArray = [...checkedArray];
                  if (checked) {
                    if (!updatedArray.includes(opt)) updatedArray.push(opt);
                  } else {
                    updatedArray = updatedArray.filter((item) => item !== opt);
                  }
                  handleChange(field.id, updatedArray);
                };

                return (
                  <FormControlLabel
                    key={idx}
                    control={
                      <Checkbox
                        checked={isChecked}
                        onChange={(e) => handleCheckboxChange(e.target.checked)}
                      />
                    }
                    label={opt}
                  />
                );
              })}
            {errors[field.id] && (
              <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                {errors[field.id]}
              </Typography>
            )}
          </FormControl>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "#f5f0e6",
        minHeight: "100vh",
        py: 4,
        px: 2,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ width: "100%", maxWidth: 650 }}
      >
        <Paper
          sx={{ p: { xs: 2, sm: 3 }, display: "flex", flexDirection: "column", gap: 2 }}
          elevation={4}
        >
          {/* Form title */}
          <Typography
            variant="h4"
            sx={{ textAlign: "center", fontWeight: "bold", color: "#5a4634" }}
          >
            {formName ? `Preview: ${formName}` : "Preview Form"}
          </Typography>

          {/* Animated form fields */}
          <form onSubmit={handleSubmit} noValidate>
            <AnimatePresence>
              {fields.map((field) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  style={{ marginBottom: "16px" }}
                >
                  {renderField(field)}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Submit button with hover animation */}
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button variant="contained" color="primary" type="submit" sx={{ mt: 2 }} fullWidth>
                Submit
              </Button>
            </motion.div>
          </form>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default PreviewFormPage;
