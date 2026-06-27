import { Box, Typography } from '@mui/material';

interface StatBoxProps {
  label: string;
  value: string;
  /** Tailwind-compatible hex/color string for text and background tint */
  color?: string;
  bgColor?: string;
}

export function StatBox({ label, value, color = '#2E7D32', bgColor = '#E8F5E9' }: StatBoxProps) {
  return (
    <Box sx={{ px: 2, py: 1, bgcolor: bgColor, borderRadius: 1 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="h6" sx={{ color }}>{value}</Typography>
    </Box>
  );
}
