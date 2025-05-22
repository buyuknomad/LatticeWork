// src/components/dashboard/ToolCard.tsx
interface ToolCardProps {
  tool: RecommendedTool;
  onLearnMore: (toolId: string) => void;
  tier: 'free' | 'premium';
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onLearnMore, tier }) => {
  const isMentalModel = tool.type === 'mental_model';
  
  const theme = isMentalModel ? {
    variant: 'mental-model' as const,
    iconColor: 'text-[#00FFFF]',
    badgeColor: 'bg-[#00FFFF]/10 text-[#00FFFF]',
    icon: <Lightbulb className="h-5 w-5" />
  } : {
    variant: 'cognitive-bias' as const,
    iconColor: 'text-amber-400',
    badgeColor: 'bg-amber-500/10 text-amber-400',
    icon: <AlertTriangle className="h-5 w-5" />
  };

  return (
    <Card variant={theme.variant} hover className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={theme.iconColor}>
          {theme.icon}
        </div>
        <Badge className={theme.badgeColor}>
          {tool.category}
        </Badge>
      </div>
      
      <h3 className="text-white font-semibold text-lg mb-2">{tool.name}</h3>
      <p className="text-gray-300 text-sm mb-4">{tool.summary}</p>
      
      {tool.explanation && (
        <details className="mb-4">
          <summary className={`text-sm cursor-pointer hover:underline ${theme.iconColor}`}>
            How it applies to your situation
          </summary>
          <p className="text-gray-400 text-sm mt-2 pl-4 border-l-2 border-gray-600">
            {tool.explanation}
          </p>
        </details>
      )}
      
      <div className="flex justify-end">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onLearnMore(tool.id)}
          className={theme.iconColor}
        >
          Learn More →
        </Button>
      </div>
    </Card>
  );
};