// src/components/ui/ErrorDisplay.tsx
interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
  suggestions?: string[];
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry, suggestions = [] }) => (
  <Card className="p-6 border-red-500/30">
    <div className="flex items-center gap-3 mb-4">
      <AlertCircle className="h-6 w-6 text-red-400" />
      <h3 className="text-lg font-semibold text-red-400">Analysis Error</h3>
    </div>
    
    <p className="text-gray-300 mb-4">{error}</p>
    
    {suggestions.length > 0 && (
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-400 mb-2">Try these instead:</h4>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, idx) => (
            <Badge key={idx} className="bg-gray-700 text-gray-300 cursor-pointer hover:bg-gray-600">
              {suggestion}
            </Badge>
          ))}
        </div>
      </div>
    )}
    
    <Button onClick={onRetry} size="sm">
      Try Again
    </Button>
  </Card>
);