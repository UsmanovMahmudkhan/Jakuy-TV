import { useBrowseContext } from '@/contexts/BrowseContext';
import CategorySection from './CategorySection';

const CategoryRows = () => {
  const { groups } = useBrowseContext();

  return (
    <>
      {groups.map(group => (
        <CategorySection key={group} group={group} />
      ))}
    </>
  );
};

export default CategoryRows;
