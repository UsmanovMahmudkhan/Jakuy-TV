import ChannelCarousel from '@/components/browse/ChannelCarousel';

interface CategorySectionProps {
  group: string;
}

const CategorySection = ({ group }: CategorySectionProps) => {
  return (
    <div>
      <div className="px-8 mb-4">
        <h2 className="text-2xl font-bold text-white">{group}</h2>
      </div>
      <ChannelCarousel category={group} limit={30} />
    </div>
  );
};

export default CategorySection;

