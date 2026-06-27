import { ProductsTab } from './ProductsTab';
import { FamiliesTab } from './FamiliesTab';
import { UnitsTab } from './UnitsTab';

interface Props {
  tab: 'list' | 'families' | 'units';
}

export function ProductsModule({ tab }: Props) {
  if (tab === 'families') return <FamiliesTab />;
  if (tab === 'units') return <UnitsTab />;
  return <ProductsTab />;
}
