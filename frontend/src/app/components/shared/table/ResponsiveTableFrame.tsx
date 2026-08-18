import { Card, Table, TableContainer } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

type TableSize = 'small' | 'medium';

interface ResponsiveTableFrameProps {
  children: ReactNode;
  minWidth?: number | string;
  maxHeight?: number | string;
  stickyHeader?: boolean;
  size?: TableSize;
  ariaLabel?: string;
  withCard?: boolean;
  cardSx?: SxProps<Theme>;
  containerSx?: SxProps<Theme>;
  tableSx?: SxProps<Theme>;
}

function sxArray(sx?: SxProps<Theme>) {
  if (!sx) return [];

  return Array.isArray(sx) ? sx : [sx];
}

export function ResponsiveTableFrame({
  children,
  minWidth = 640,
  maxHeight,
  stickyHeader = Boolean(maxHeight),
  size = 'small',
  ariaLabel,
  withCard = true,
  cardSx,
  containerSx,
  tableSx,
}: ResponsiveTableFrameProps) {
  const content = (
    <TableContainer
      sx={[
        {
          width: '100%',
          maxWidth: '100%',
          maxHeight,
          overflowX: 'auto',
          overflowY: maxHeight ? 'auto' : 'hidden',
          WebkitOverflowScrolling: 'touch',
        },
        ...sxArray(containerSx),
      ]}
    >
      <Table
        size={size}
        stickyHeader={stickyHeader}
        aria-label={ariaLabel}
        sx={[
          {
            minWidth,
          },
          ...sxArray(tableSx),
        ]}
      >
        {children}
      </Table>
    </TableContainer>
  );

  if (!withCard) {
    return content;
  }

  return (
    <Card
      sx={[
        {
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden',
        },
        ...sxArray(cardSx),
      ]}
    >
      {content}
    </Card>
  );
}
