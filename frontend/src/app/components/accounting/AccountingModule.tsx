import { ChartOfAccountsTab } from './ChartOfAccountsTab';
import { CostCentersTab } from './CostCentersTab';
import { DREGroupsTab } from './DREGroupsTab';
import { IncomeStatementRelationshipsTab } from './IncomeStatementRelationshipsTab';

interface Props {
  tab: 'chart' | 'cost-centers' | 'dre' | 'dre-relationships';
}

export function AccountingModule({ tab }: Props) {
  if (tab === 'cost-centers') return <CostCentersTab />;
  if (tab === 'dre') return <DREGroupsTab />;
  if (tab === 'dre-relationships') return <IncomeStatementRelationshipsTab />;
  return <ChartOfAccountsTab />;
}
