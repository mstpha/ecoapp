import { ErrorMessage } from '@/components/ErrorMessage';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useMyMissions } from '@/hooks/useMyMissions';
import { ParticipationWithMission } from '@/types/participation.types';
import { Href, router } from 'expo-router';
import React from 'react';
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const categoryEmoji: Record<string, string> = {
  cleanup: '🏖️',
  planting: '🌳',
  workshop: '♻️',
  recycling: '📦',
  awareness: '📢',
};

const categoryLabels: Record<string, string> = {
  cleanup: 'Nettoyage',
  planting: "Plantation d'arbres",
  workshop: 'Atelier',
  recycling: 'Recyclage',
  awareness: 'Sensibilisation',
};

function MissionItem({ item }: { item: ParticipationWithMission }) {
  const mission = item.mission;
  const isCancelled = item.status === 'cancelled';
  const isCompleted = item.status === 'completed';
  const isPast = mission && new Date(mission.date) < new Date();

  if (!mission) return null;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/mission/${mission.id}` as Href)}
      activeOpacity={0.7}
      style={{
        backgroundColor: '#1f2937',
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: isCancelled ? '#4b1010' : '#374151',
        overflow: 'hidden',
      }}
    >
      {/* Status banner */}
      {isCancelled && (
        <View style={{
          backgroundColor: '#7f1d1d',
          paddingHorizontal: 16, paddingVertical: 6,
          flexDirection: 'row', alignItems: 'center', gap: 6,
        }}>
          <Text style={{ fontSize: 12 }}>❌</Text>
          <Text style={{ color: '#fca5a5', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 }}>
            INSCRIPTION ANNULÉE — Appuyez pour vous réinscrire
          </Text>
        </View>
      )}
      {isCompleted && (
        <View style={{
          backgroundColor: '#14532d',
          paddingHorizontal: 16, paddingVertical: 6,
          flexDirection: 'row', alignItems: 'center', gap: 6,
        }}>
          <Text style={{ fontSize: 12 }}>✅</Text>
          <Text style={{ color: '#86efac', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 }}>
            MISSION COMPLÉTÉE
          </Text>
        </View>
      )}

      <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, opacity: isCancelled ? 0.75 : 1 }}>
        <View style={{
          width: 52, height: 52, borderRadius: 12,
          backgroundColor: isCancelled ? '#374151' : '#065f46',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ fontSize: 24 }}>{categoryEmoji[mission.category] ?? '🌿'}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ color: '#f9fafb', fontSize: 15, fontWeight: '700', marginBottom: 4 }} numberOfLines={1}>
            {mission.title}
          </Text>
          <Text style={{ color: '#6b7280', fontSize: 12, marginBottom: 6 }}>
            {categoryLabels[mission.category]}
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Text style={{ color: '#6b7280', fontSize: 12 }}>📍 {mission.location}</Text>
            <Text style={{ color: '#6b7280', fontSize: 12 }}>⏱ {mission.duration_hours}h</Text>
          </View>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color: isCancelled ? '#ef4444' : isPast ? '#6b7280' : '#10b981', fontSize: 11, fontWeight: '600' }}>
            {isCancelled
              ? 'Annulée'
              : new Date(mission.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          </Text>
          {!isCancelled && (
            <Text style={{ color: '#4b5563', fontSize: 11, marginTop: 2 }}>
              {new Date(mission.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function MyMissionsScreen() {
  const { data: missions, isLoading, isError, error, refetch, isRefetching } = useMyMissions();
  const insets = useSafeAreaInsets();

  if (isLoading) return <LoadingSpinner message="Chargement de vos missions..." />;

  if (isError) {
    return (
      <ErrorMessage
        message={error instanceof Error ? error.message : 'Erreur de chargement'}
        onRetry={refetch}
      />
    );
  }

  const activeMissions = missions?.filter(m => m.status !== 'cancelled') ?? [];
  const cancelledMissions = missions?.filter(m => m.status === 'cancelled') ?? [];
  const allMissions = [...activeMissions, ...cancelledMissions];

  return (
    <View style={{ flex: 1, backgroundColor: '#111827' }}>
      <FlatList
        data={allMissions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MissionItem item={item} />}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 16 }}
        ListHeaderComponent={
          allMissions.length > 0 ? (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: '#9ca3af', fontSize: 13 }}>
                {activeMissions.length} active{activeMissions.length !== 1 ? 's' : ''}
                {cancelledMissions.length > 0 && ` • ${cancelledMissions.length} annulée${cancelledMissions.length !== 1 ? 's' : ''}`}
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={() => (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
            <Text style={{ fontSize: 64, marginBottom: 16 }}>📋</Text>
            <Text style={{ color: '#f9fafb', fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
              Aucune mission
            </Text>
            <Text style={{ color: '#9ca3af', textAlign: 'center', paddingHorizontal: 32, lineHeight: 22 }}>
              Vous n'êtes inscrit à aucune mission pour le moment.{'\n'}
              Explorez les missions disponibles !
            </Text>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#10b981"
            colors={['#10b981']}
          />
        }
      />
    </View>
  );
}