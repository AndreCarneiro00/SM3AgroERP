import { ChartOfAccountsTab } from './ChartOfAccountsTab';
import { CostCentersTab } from './CostCentersTab';
import { DREGroupsTab } from './DREGroupsTab';

interface Props {
  tab: 'chart' | 'cost-centers' | 'dre';
}

export function AccountingModule({ tab }: Props) {
  if (tab === 'cost-centers') return <CostCentersTab />;
  if (tab === 'dre') return <DREGroupsTab />;
  return <ChartOfAccountsTab />;
}
