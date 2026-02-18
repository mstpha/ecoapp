import React from 'react';
import { Text, View } from 'react-native';
import { Button } from './Button';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50 px-6">
      <Text className="text-6xl mb-4">:warning:</Text>
      <Text className="text-gray-900 text-lg font-semibold mb-2 text-center">
        Une erreur est survenue
      </Text>
      <Text className="text-gray-600 text-center mb-6">{message}</Text>
      {onRetry && <Button title="Réessayer" onPress={onRetry} />}
    </View>
  );
}