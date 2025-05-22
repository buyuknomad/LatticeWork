// src/components/ui/Input.tsx
interface InputProps {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  error?: string;
  className?: string;
}

const Input: React.FC<InputProps> = ({ icon, error, className, ...props }) => {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        className={clsx(
          "w-full bg-[#2A2D35] text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00FFFF] transition-shadow",
          icon && "pl-10",
          error && "ring-2 ring-red-500",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-red-400 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};