/* eslint-disable @typescript-eslint/no-unused-vars */
// 📄 MyFormsPage.tsx
// ✅ Fully animated with Framer Motion
// ✅ Fully responsive with Material UI Grid
// ✅ Smooth transitions for entering & hovering cards
// ✅ Commented for clarity

import React from "react";
import { getSavedForms } from "../utils/localStorage"; // Utility function to fetch saved forms
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  useTheme,
} from "@mui/material";
import PreviewIcon from "@mui/icons-material/Visibility";
import { motion } from "framer-motion"; // Animation library

const MyFormsPage: React.FC = () => {
  const forms = getSavedForms(); // Get forms from localStorage
  const navigate = useNavigate();
  const theme = useTheme();

  // Animation variants for the grid container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }, // delay between child animations
    },
  };

  // Animation for each form card
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60 } },
    hover: { scale: 1.03, boxShadow: "0px 8px 25px rgba(0,0,0,0.15)" },
  };

  // If there are no saved forms, show a friendly empty state
  if (!forms || forms.length === 0) {
    return (
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        sx={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          bgcolor: "#f5f5dc", // Beige background
          p: 2,
        }}
      >
        <Typography variant="h5" sx={{ mb: 2 }}>
          No forms saved yet 📄
        </Typography>
        <Button
          variant="contained"
          sx={{
            bgcolor: "#d2b48c",
            "&:hover": { bgcolor: "#c19a6b" },
          }}
          onClick={() => navigate("/")}
        >
          Create a Form
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f5dc", // Beige background
        p: { xs: 2, sm: 4 }, // Responsive padding
      }}
      component={motion.div}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Page Title */}
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          fontWeight: "bold",
          textAlign: "center",
          color: theme.palette.text.primary,
        }}
      >
        My Saved Forms
      </Typography>

      {/* Forms Grid */}
      <Grid container spacing={3}>
        {forms.map((form, index) => (
          <Grid item xs={12} sm={6} md={4} key={form.id}>
            {/* Animated Card */}
            <Card
              component={motion.div}
              variants={cardVariants}
              whileHover="hover"
              sx={{
                borderRadius: 3,
                boxShadow: 4,
                bgcolor: "#fff8dc", // Light beige card
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "all 0.3s ease-in-out",
              }}
            >
              <CardContent>
                {/* Form Name */}
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {form.name}
                </Typography>
                {/* Creation Date */}
                <Typography variant="body2" sx={{ color: "gray" }}>
                  Created: {new Date(form.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>

              {/* Preview Button */}
              <Box sx={{ p: 2, pt: 0, textAlign: "right" }}>
                <Button
                  variant="contained"
                  startIcon={<PreviewIcon />}
                  sx={{
                    bgcolor: "#deb887",
                    "&:hover": { bgcolor: "#d2b48c" },
                    borderRadius: 2,
                  }}
                  onClick={() => navigate(`/preview/${form.id}`)} // Navigate to preview page
                >
                  Preview
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MyFormsPage;
