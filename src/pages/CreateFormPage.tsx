/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import {
  addField,
  resetForm,
  setFormName,
  updateField,
  deleteField,
  reorderFields,
} from "../redux/formSlice";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  IconButton,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  Checkbox,
  FormGroup,
  InputAdornment,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  ArrowUpward,
  ArrowDownward,
  Delete,
} from "@mui/icons-material";
import { v4 as uuidv4 } from "uuid";
import type { FormField, FieldType } from "../types/formTypes";
import { saveForm } from "../utils/localStorage";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Import dnd-kit components
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const FIELD_TYPES: FieldType[] = [
  "text",
  "number",
  "textarea",
  "select",
  "radio",
  "checkbox",
  "date",
  "password",
];

// Helper to detect birth-related labels
const isBirthRelatedLabel = (label: string) => {
  const lower = label.toLowerCase();
  return (
    lower.includes("birth") ||
    lower.includes("dob") ||
    lower.includes("date of birth")
  );
};

// Create a SortableItem wrapper for each field to enable drag and drop
function SortableItem(props: { id: string; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragging ? "grabbing" : "grab",
    zIndex: isDragging ? 999 : "auto",
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      {props.children}
    </motion.div>
  );
}

const CreateFormPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { fields, formName } = useSelector((state: RootState) => state.form);
  const [formNameInput, setFormNameInput] = useState(formName);

  // Track password visibility per field ID
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
    {}
  );

  const handleTogglePasswordVisibility = (id: string) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddField = (type: FieldType) => {
    const newField: FormField = {
      id: uuidv4(),
      type,
      label: "", // start with empty label
      defaultValue: "", // always empty defaultValue initially
      validation: {},
      options:
        type === "select" || type === "radio" || type === "checkbox"
          ? ["Option 1", "Option 2", "Option 3", "Option 4"]
          : undefined,
      derived: false,
      parentFields: [],
      formula: "",
    };
    dispatch(addField(newField));
  };

  const handleFieldChange = (id: string, key: keyof FormField, value: any) => {
    const updated = fields.find((f) => f.id === id);
    if (!updated) return;
    dispatch(updateField({ ...updated, [key]: value }));
  };

  const handleReorder = (index: number, direction: "up" | "down") => {
    const newFields = [...fields];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFields.length) return;
    [newFields[index], newFields[targetIndex]] = [
      newFields[targetIndex],
      newFields[index],
    ];
    dispatch(reorderFields(newFields));
  };

  // Handle drag end event for @dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // slight delay to start drag
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      const newFields = arrayMove(fields, oldIndex, newIndex);
      dispatch(reorderFields(newFields));
    }
  };

  const handleSave = () => {
    if (!formNameInput.trim()) return alert("Please enter a form name.");
    const formSchema = {
      id: uuidv4(),
      name: formNameInput,
      createdAt: new Date().toLocaleString(),
      fields,
    };
    saveForm(formSchema);
    dispatch(resetForm());
    alert("Form saved successfully!");
    navigate("/myforms");
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f5f5dc", minHeight: "100vh" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper
          sx={{
            p: { xs: 2, md: 4 },
            maxWidth: 900,
            mx: "auto",
            borderRadius: 3,
            boxShadow: 4,
            bgcolor: "#fffaf3",
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            fontWeight="bold"
            sx={{ color: "#5a4634" }}
          >
            Create a New Form
          </Typography>
          <Typography variant="body2" sx={{ color: "#7a6a56", mb: 3 }}>
            Build your form by adding fields, customizing labels, setting
            options and rules. You can also create derived fields that
            auto-calculate values.
          </Typography>

          <TextField
            fullWidth
            label="Form Name"
            value={formNameInput}
            onChange={(e) => {
              setFormNameInput(e.target.value);
              dispatch(setFormName(e.target.value));
            }}
            margin="normal"
          />

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <AnimatePresence>
                {fields.map((field, index) => (
                  <SortableItem key={field.id} id={field.id}>
                    <Paper
                      sx={{
                        p: 2,
                        my: 2,
                        bgcolor: "#fff8e1",
                        borderRadius: 2,
                        boxShadow: 2,
                        "&:hover": { boxShadow: 4 },
                        userSelect: "none", // Prevent text selection while dragging
                      }}
                    >
                      <Grid container spacing={2} alignItems="center">
                        {/* Field Type */}
                        <Grid item xs={12} sm={4}>
                          <TextField
                            select
                            label="Field Type"
                            value={field.type}
                            onChange={(e) =>
                              handleFieldChange(
                                field.id,
                                "type",
                                e.target.value as FieldType
                              )
                            }
                            fullWidth
                          >
                            {FIELD_TYPES.map((ft) => (
                              <MenuItem key={ft} value={ft}>
                                {ft}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>

                        {/* Label */}
                        <Grid item xs={12} sm={4}>
                          <TextField
                            label="Label"
                            value={field.label}
                            onChange={(e) =>
                              handleFieldChange(
                                field.id,
                                "label",
                                e.target.value
                              )
                            }
                            fullWidth
                          />
                        </Grid>

                        {/* Default Value / Password Field with toggle */}
                        {field.type !== "radio" && (
                          <Grid item xs={12} sm={4}>
                            {field.type === "password" ? (
                              <TextField
                                label="Default Value"
                                type={
                                  showPasswords[field.id] ? "text" : "password"
                                }
                                value={field.defaultValue || ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    field.id,
                                    "defaultValue",
                                    e.target.value
                                  )
                                }
                                fullWidth
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton
                                        onClick={() =>
                                          handleTogglePasswordVisibility(
                                            field.id
                                          )
                                        }
                                        edge="end"
                                        aria-label="toggle password visibility"
                                      >
                                        {showPasswords[field.id] ? (
                                          <VisibilityOff />
                                        ) : (
                                          <Visibility />
                                        )}
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            ) : (
                              <TextField
                                label="Default Value"
                                value={field.defaultValue || ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    field.id,
                                    "defaultValue",
                                    e.target.value
                                  )
                                }
                                fullWidth
                              />
                            )}
                          </Grid>
                        )}

                        {/* Required */}
                        <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={!!field.validation?.required}
                                onChange={(e) =>
                                  handleFieldChange(field.id, "validation", {
                                    ...field.validation,
                                    required: e.target.checked,
                                  })
                                }
                              />
                            }
                            label="Required"
                          />
                        </Grid>

                        {/* Validation Rules */}
                        {(field.type === "text" ||
                          field.type === "textarea" ||
                          field.type === "number" ||
                          field.type === "date") && (
                          <>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                type="number"
                                label="Min Length"
                                value={field.validation?.minLength || ""}
                                onChange={(e) =>
                                  handleFieldChange(field.id, "validation", {
                                    ...field.validation,
                                    minLength: e.target.value
                                      ? parseInt(e.target.value)
                                      : undefined,
                                  })
                                }
                                fullWidth
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                type="number"
                                label="Max Length"
                                value={field.validation?.maxLength || ""}
                                onChange={(e) =>
                                  handleFieldChange(field.id, "validation", {
                                    ...field.validation,
                                    maxLength: e.target.value
                                      ? parseInt(e.target.value)
                                      : undefined,
                                  })
                                }
                                fullWidth
                              />
                            </Grid>
                          </>
                        )}

                        {/* Email & Password rule for text type */}
                        {field.type === "text" && (
                          <Grid item xs={12}>
                            <FormGroup row>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={!!field.validation?.email}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        field.id,
                                        "validation",
                                        {
                                          ...field.validation,
                                          email: e.target.checked,
                                        }
                                      )
                                    }
                                  />
                                }
                                label="Email format"
                              />
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={!!field.validation?.passwordRule}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        field.id,
                                        "validation",
                                        {
                                          ...field.validation,
                                          passwordRule: e.target.checked,
                                        }
                                      )
                                    }
                                  />
                                }
                                label="Password rule (min 8 chars, 1 number)"
                              />
                            </FormGroup>
                          </Grid>
                        )}

                        {/* Options for select/radio/checkbox */}
                        {(field.type === "select" ||
                          field.type === "radio" ||
                          field.type === "checkbox") && (
                          <Grid item xs={12}>
                            <TextField
                              label="Options (comma separated)"
                              value={field.options?.join(", ") || ""}
                              onChange={(e) =>
                                handleFieldChange(
                                  field.id,
                                  "options",
                                  e.target.value.split(",").map((o) => o.trim())
                                )
                              }
                              fullWidth
                            />
                          </Grid>
                        )}

                        {/* Derived Field Controls - ONLY for date fields with birth-related label */}
                        {field.type === "date" &&
                          isBirthRelatedLabel(field.label) && (
                            <Grid item xs={12}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={field.derived || false}
                                    onChange={(e) =>
                                      handleFieldChange(
                                        field.id,
                                        "derived",
                                        e.target.checked
                                      )
                                    }
                                  />
                                }
                                label="Derived Field (Calculate Age)"
                              />
                            </Grid>
                          )}
                        {field.derived &&
                          field.type === "date" &&
                          isBirthRelatedLabel(field.label) && (
                            <Grid item xs={12}>
                              <TextField
                                label="Formula / Logic"
                                placeholder="Auto-calculates current age from birth date"
                                value={
                                  field.formula || "currentYear - birthYear"
                                }
                                InputProps={{ readOnly: true }}
                                fullWidth
                              />
                            </Grid>
                          )}

                        {/* Reorder & Delete */}
                        <Grid item xs={12}>
                          <IconButton
                            onClick={() => handleReorder(index, "up")}
                          >
                            <ArrowUpward />
                          </IconButton>
                          <IconButton
                            onClick={() => handleReorder(index, "down")}
                          >
                            <ArrowDownward />
                          </IconButton>
                          <IconButton
                            onClick={() => dispatch(deleteField(field.id))}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Paper>
                  </SortableItem>
                ))}
              </AnimatePresence>
            </SortableContext>
          </DndContext>

          {/* Add Field Buttons */}
          <Box sx={{ my: 2 }}>
            {FIELD_TYPES.map((type) => (
              <motion.div
                key={type}
                whileHover={{ scale: 1.05 }}
                style={{ display: "inline-block", margin: 4 }}
              >
                <Button
                  variant="outlined"
                  onClick={() => handleAddField(type)}
                  sx={{ textTransform: "capitalize" }}
                >
                  Add {type}
                </Button>
              </motion.div>
            ))}
          </Box>

          {/* Save Button */}
          <motion.div whileHover={{ scale: 1.05 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              fullWidth
              sx={{ py: 1.2, fontSize: "1rem" }}
            >
              Save Form
            </Button>
          </motion.div>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default CreateFormPage;
