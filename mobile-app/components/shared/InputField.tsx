import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  keyboardType = 'default',
  autoCapitalize = 'none',
}) => {
  return (
    <View className="mb-4">
      <Text className="text-gray-900 text-sm mb-1 font-medium">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        placeholderTextColor="#9ca3af"
        className={`px-3 py-3 border rounded-xl bg-white text-gray-900 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error ? <Text className="text-red-600 text-xs mt-1 font-medium">{error}</Text> : null}
    </View>
  );
};

export default InputField;
