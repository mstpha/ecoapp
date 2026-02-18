import { ErrorMessage } from '@/components/ErrorMessage';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MissionCard } from '@/components/MissionCard';
import { useUserMissions } from '@/hooks/useMissions';
import React from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';

export default function MyMissionsScreen() {
  const { data: missions, isLoading, isError, error, refetch } = useUserMissions();

  if (isLoading) {
    return <LoadingSpinner message="Chargement de vos missions..." />;
  }

  if (isError) {
    return (
      <ErrorMessage
        message={error instanceof Error ? error.message : 'Erreur de chargement'}
        onRetry={refetch}
      />
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={missions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MissionCard mission={item} />}
        contentContainerClassName="p-4"
        ListEmptyComponent={() => (
          <View className="items-center justify-center py-12">
            <Text className="text-6xl mb-4">📋</Text>
            <Text className="text-gray-900 text-xl font-bold mb-2">
              Aucune mission
            </Text>
            <Text className="text-gray-600 text-center px-8">
              Vous n'êtes inscrit à aucune mission pour le moment.{'\n'}
              Explorez les missions disponibles !
            </Text>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refetch}
            tintColor="#059669"
          />
        }
      />
    </View>
  );
}