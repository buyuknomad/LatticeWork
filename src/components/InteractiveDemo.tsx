// This is just the modified portion of the InteractiveDemo component
// that increases the height for better visual impact

// Near the end of the InteractiveDemo.tsx file, find the return statement:

return (
  <motion.div 
    className="w-full h-80 bg-[#202020] rounded-lg overflow-hidden relative" // Changed height from h-64 to h-80
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <canvas 
      ref={canvasRef} 
      className="w-full h-full"
      onMouseMove={handleCanvasMouseMove}
      onMouseLeave={handleCanvasMouseLeave}
    />
    {/* Enhanced gradient overlay for better depth perception */}
    <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-[#202020]/40" />
  </motion.div>
);