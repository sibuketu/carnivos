import { useEffect, useState, useRef } from 'react';
import { useTranslation } from '../../utils/i18n';
import { type FoodMasterItem, searchFoodMasterItems } from '../../data/foodMaster';
import { X, Search } from 'lucide-react'; // Assuming lucide-react is available, otherwise use text

interface FoodSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (item: FoodMasterItem) => void;
    initialQuery?: string;
}

export default function FoodSearchModal({
    isOpen,
    onClose,
    onSelect,
    initialQuery = '',
}: FoodSearchModalProps) {
    const { t, language } = useTranslation();
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<FoodMasterItem[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initialize query when modal opens
    useEffect(() => {
        if (isOpen) {
            setQuery(initialQuery);
            // Determine language for immediate search if needed, or just let the query effect handle it
            const matches = searchFoodMasterItems(initialQuery);
            setResults(matches);

            // Auto-focus input
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen, initialQuery]);

    // Search effect
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }
        const timer = setTimeout(() => {
            const matches = searchFoodMasterItems(query);
            setResults(matches);
        }, 300); // Debounce
        return () => clearTimeout(timer);
    }, [query]);

    if (!isOpen) return null;

    const currentLang = language || 'ja';

    const getDisplayName = (item: FoodMasterItem) => {
        if (currentLang === 'ja') return item.name_ja;
        if (currentLang === 'fr') return item.name_fr || item.name;
        if (currentLang === 'de') return item.name_de || item.name;
        return item.name;
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-stone-900/95 backdrop-blur-md animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-stone-800">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('butcher.searchPlaceholder')}
                        className="w-full bg-stone-800 text-stone-100 pl-10 pr-4 py-3 rounded-xl border border-stone-700 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    />
                </div>
                <button
                    onClick={onClose}
                    className="p-3 bg-stone-800 text-stone-400 rounded-xl hover:bg-stone-700 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {results.length === 0 && query.trim() !== '' && (
                    <div className="text-center py-10 text-stone-500">
                        No results found for "{query}"
                    </div>
                )}

                {results.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            onSelect(item);
                            onClose();
                        }}
                        className="w-full text-left p-4 bg-stone-800/50 rounded-xl border border-stone-800 hover:border-red-500/30 hover:bg-stone-800 transition-all group"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-stone-200 group-hover:text-red-400 transition-colors">
                                    {getDisplayName(item)}
                                </h4>
                                <p className="text-xs text-stone-500 mt-1">{item.name}</p>
                            </div>
                            <div className="text-right text-xs text-stone-400 space-y-0.5">
                                <div>P: {item.protein.value}g</div>
                                <div>F: {item.fat.value}g</div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
