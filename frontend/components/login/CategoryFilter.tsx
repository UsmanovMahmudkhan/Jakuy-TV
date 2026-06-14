import { Button } from "../ui/button";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

const CategoryFilter = ({ categories, selectedCategory, onCategorySelect }: CategoryFilterProps) => {
  const allCategories = ["All", ...categories];

  return (
    <div className="flex flex-wrap gap-2">
      {allCategories.map((category) => (
        <div key={category} className="flex gap-2 shrink-0 flex-wrap">
          <Button variant={selectedCategory === (category === "All" ? null : category) ? "default" : "outline"} size="sm" onClick={() => onCategorySelect(category === "All" ? null : category)}>
            {category}
          </Button>
        </div>
      ))}
    </div>
  );
};

export default CategoryFilter;
