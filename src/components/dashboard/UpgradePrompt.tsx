// src/components/dashboard/UpgradePrompt.tsx
const UpgradePrompt: React.FC = () => (
  <Card className="p-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
    <div className="flex items-center gap-4">
      <div className="bg-purple-500/20 p-3 rounded-full">
        <Crown className="h-8 w-8 text-purple-400" />
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-white mb-2">
          Unlock the Full Power of Cosmic Lattice
        </h3>
        <p className="text-gray-300 mb-4">
          Get unlimited queries, deeper insights, and interactive visualizations.
        </p>
        <Button>Upgrade to Premium</Button>
      </div>
    </div>
  </Card>
);