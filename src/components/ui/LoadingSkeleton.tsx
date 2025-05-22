// src/components/ui/LoadingSkeleton.tsx
const ToolCardSkeleton: React.FC = () => (
  <Card className="p-6">
    <div className="animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="h-5 w-5 bg-gray-700 rounded"></div>
        <div className="h-6 w-20 bg-gray-700 rounded-full"></div>
      </div>
      <div className="h-6 w-3/4 bg-gray-700 rounded mb-2"></div>
      <div className="h-4 w-full bg-gray-700 rounded mb-2"></div>
      <div className="h-4 w-2/3 bg-gray-700 rounded mb-4"></div>
      <div className="h-8 w-24 bg-gray-700 rounded ml-auto"></div>
    </div>
  </Card>
);

const QueryLoadingState: React.FC = () => (
  <div className="py-12 flex flex-col items-center justify-center">
    <div className="relative">
      <div className="h-16 w-16 rounded-full border-t-2 border-b-2 border-[#00FFFF] animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-10 w-10 rounded-full bg-[#212327]"></div>
      </div>
    </div>
    <p className="mt-4 text-gray-400">Analyzing your query with Cosmic Lattice...</p>
  </div>
);