// src/components/dashboard/QueryInput.tsx
interface QueryInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  suggestions: string[];
}

const QueryInput: React.FC<QueryInputProps> = ({ 
  value, 
  onChange, 
  onSubmit, 
  isLoading, 
  suggestions 
}) => {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          placeholder="What's on your mind? Ask any question..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          icon={<Search className="h-5 w-5" />}
          className="pr-20"
        />
        
        {value && !isLoading && (
          <button
            onClick={() => onChange('')}
            className="absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
          >
            <X size={18} />
          </button>
        )}
        
        <Button
          onClick={onSubmit}
          disabled={!value.trim() || isLoading}
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
          size="sm"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight size={16} />}
        </Button>
      </div>
      
      {/* Query Suggestions */}
      {suggestions.length > 0 && !value && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-400">Try asking about:</h4>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onChange(suggestion)}
                className="bg-[#2A2D35] text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm hover:bg-[#333740] transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};