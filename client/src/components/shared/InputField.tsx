import React from 'react';

interface InputFieldProps {
  label: string;
  type?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
}) => {
  return (
    <div className="flex flex-col">
      <label className="text-black text-sm mb-1 font-medium">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-black ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        required
      />
      {error ? (
        <span id={`${name}-error`} className="text-red-600 text-xs mt-1">
          {error}
        </span>
      ) : null}
    </div>
  );
};

export default InputField;
