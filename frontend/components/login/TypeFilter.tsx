import { Button } from "@/components/ui/button";
import { IptvOrgPlaylist } from "@/lib/iptv-org-playlists";

interface TypeFilterProps {
  selectedType: IptvOrgPlaylist['type'] | null;
  onTypeSelect: (type: IptvOrgPlaylist['type'] | null) => void;
  totalCount: number;
  categoryCount?: number;
  languageCount?: number;
  countryCount?: number;
}

export const TypeFilter = ({
  selectedType,
  onTypeSelect,
  totalCount,
  categoryCount,
  languageCount,
  countryCount,
}: TypeFilterProps) => {
  return (
    <div className="flex gap-2 shrink-0 flex-wrap">
      <Button
        variant={selectedType === null ? 'default' : 'outline'}
        size="sm"
        onClick={() => onTypeSelect(null)}
      >
        All ({totalCount})
      </Button>
      {categoryCount !== undefined && categoryCount > 0 && (
        <Button
          variant={selectedType === 'category' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onTypeSelect('category')}
        >
          Categories ({categoryCount})
        </Button>
      )}
      {languageCount !== undefined && languageCount > 0 && (
        <Button
          variant={selectedType === 'language' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onTypeSelect('language')}
        >
          Languages ({languageCount})
        </Button>
      )}
      {countryCount !== undefined && countryCount > 0 && (
        <Button
          variant={selectedType === 'country' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onTypeSelect('country')}
        >
          Countries ({countryCount})
        </Button>
      )}
    </div>
  );
};