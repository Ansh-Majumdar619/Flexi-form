import { Routes, Route, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CreateFormPage from './pages/CreateFormPage';
import PreviewFormPage from './pages/PreviewFormPage';
import MyFormsPage from './pages/MyFormsPage';
import { Container, Typography, Box, Paper, Divider, Button, Stack } from '@mui/material';

function App() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f5f0e6',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        py: 4,
      }}
    >
      <Container maxWidth="md">
        {/* Animated Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Paper
            elevation={4}
            sx={{
              p: 4,
              borderRadius: 4,
              bgcolor: '#fffaf3',
              textAlign: 'center',
              mb: 4,
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 'bold',
                color: '#5a4634',
                mb: 1,
                cursor: 'pointer',
                userSelect: 'none',
                '&:hover': {
                  color: '#8b6f47',
                  textDecoration: 'underline',
                },
              }}
              onClick={() => navigate('/')}
            >
              🛠️ FlexiForm
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#7a6a56', lineHeight: 1.6 }}>
            Build a powerful form builder that lets users create, customize, and save dynamic forms without writing any code.
            Add various field types, configure labels, validations, and derived calculations, reorder fields easily, and preview how the form behaves for end users. All form configurations are saved locally, enabling users to manage and revisit their forms anytime — no backend required.
            </Typography>

            {/* Animated Buttons */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="center"
                sx={{ mt: 3 }}
              >
                <Button
                  variant="contained"
                  sx={{ bgcolor: '#8b6f47', '&:hover': { bgcolor: '#6d5432' } }}
                  onClick={() => navigate('/create')}
                >
                  Create Form
                </Button>
                <Button
                  variant="outlined"
                  sx={{ borderColor: '#8b6f47', color: '#8b6f47', '&:hover': { bgcolor: '#f0e6d2' } }}
                  onClick={() => navigate('/preview/1')} // Example ID
                >
                  Preview Form
                </Button>
                <Button
                  variant="outlined"
                  sx={{ borderColor: '#8b6f47', color: '#8b6f47', '&:hover': { bgcolor: '#f0e6d2' } }}
                  onClick={() => navigate('/myforms')}
                >
                  My Forms
                </Button>
              </Stack>
            </motion.div>
          </Paper>
        </motion.div>

        <Divider sx={{ my: 4, bgcolor: '#d1bfa7' }} />

        {/* Animated Routes Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: '#fffaf3',
            }}
          >
            <Routes>
              <Route path="/create" element={<CreateFormPage />} />
              <Route path="/preview/:id" element={<PreviewFormPage />} />
              <Route path="/myforms" element={<MyFormsPage />} />
            </Routes>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}

export default App;
