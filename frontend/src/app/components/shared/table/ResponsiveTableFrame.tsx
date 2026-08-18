import { Card, Table, TableContainer } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

type TableSize = 'small' | 'medium';
type FluidBreakpoint = false | 'sm' | 'md' | 'lg' | 'xl';

interface ResponsiveTableFrameProps {
  children: ReactNode;
  minWidth?: number | string;
  maxHeight?: number | string;
  stickyHeader?: boolean;
  fluidBreakpoint?: FluidBreakpoint;
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

function getResponsiveMinWidth(
  minWidth: number | string,
  fluidBreakpoint: FluidBreakpoint,
) {
  if (!fluidBreakpoint) return minWidth;

  return {
    xs: minWidth,
    [fluidBreakpoint]: '100%',
  };
}

export function ResponsiveTableFrame({
  children,
  minWidth = 640,
  maxHeight,
  stickyHeader = Boolean(maxHeight),
  fluidBreakpoint = 'lg',
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
          minWidth: 0,
          maxWidth: '100%',
          maxHeight,
          overflowX: 'auto',
          overflowY: maxHeight ? 'auto' : 'visible',
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
            width: '100%',
            tableLayout: 'auto',
            minWidth: getResponsiveMinWidth(minWidth, fluidBreakpoint),
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
          minWidth: 0,
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
