import { memo, forwardRef } from 'react';
import { useSelector } from 'react-redux';

const Input = memo(forwardRef(({
  label,
  error,
  type = 'text',
  placeholder,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}, ref) => {
  const { mode } = useSelector((state) => state.theme);
  const isDark = mode === 'dark';
  const bgClass = isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';

  return (
    <div className="w-full">
      {label && (
        <label className={`block text-sm font-medium ${textClass} mb-2`}>
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-2.5 rounded-lg border-2 transition-colors
            ${Icon ? 'pl-10' : ''}
            ${bgClass}
            ${textClass}
            ${error ? 'border-red-500' : 'border-transparent focus:border-blue-500'}
            disabled:opacity-50 disabled:cursor-not-allowed
            focus:outline-none
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}));

Input.displayName = 'Input';
export default Input;
