// src/components/dashboard/RelationshipsSummary.tsx
const RelationshipsSummary: React.FC<{ summary: string }> = ({ summary }) => (
  <Card variant="default" className="p-6 border-purple-500/30">
    <div className="flex items-center gap-3 mb-4">
      <Crown className="h-6 w-6 text-purple-400" />
      <h3 className="text-lg font-semibold text-purple-400">Connections & Interactions</h3>
      <Badge className="bg-purple-500/10 text-purple-400 text-xs">PREMIUM</Badge>
    </div>
    <p className="text-gray-300 whitespace-pre-line">{summary}</p>
  </Card>
);