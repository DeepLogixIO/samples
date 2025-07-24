import {Box, Paper, Typography} from "@mui/material";

export default function ChatMessage({content, role}) {
  return (
    <Box
      display="flex"
      flexDirection={role === 'user' ? 'row-reverse' : 'row'}
      alignItems="flex-start"
      mb={2}
    >
      <Paper
        elevation={3}
        sx={{
          px: 2,
          py: 1,
          bgcolor: role === 'user' ? 'primary.main' : 'grey.200',
          color: role === 'user' ? 'primary.contrastText' : 'text.primary',
          maxWidth: '300px',
        }}
      >
        <Typography variant="body2">{content}</Typography>
      </Paper>
    </Box>
  )
}