import React from 'react';

interface InputFieldProps {
  label: string;
  type?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  error,
}) => {
  return (
    <div className="w-full">
      {/* 🔥 LABEL (CHANGED HERE) */}
      <label className="block text-sm font-semibold text-white mb-2">
        {label}
      </label>

      {/* 🔥 INPUT (CHANGED FOR DARK THEME) */}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`
          w-full
          px-4 py-3
          rounded-xl
          bg-white/5
          border
          ${error ? 'border-red-500' : 'border-white/10'}
          text-white
          placeholder-gray-400
          backdrop-blur
          focus:ring-2 focus:ring-brick-500
          focus:border-transparent
          outline-none
          transition-all
        `}
      />

      {/* 🔥 ERROR MESSAGE */}
      {error && (
        <p className="mt-2 text-sm text-red-400 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;
