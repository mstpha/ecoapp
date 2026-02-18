import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Button } from '../../components/Button';
import { ErrorMessage } from '../../components/ErrorMessage';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useCancelParticipation, useMission, useRegisterMission } from '../../hooks/useMissions';

const categoryLabels: Record<string, string> = {
  cleanup: 'Nettoyage',
  planting: "Plantation d'arbres",
  workshop: 'Atelier',
  recycling: 'Recyclage',
  awareness: 'Sensibilisation',
};

const categoryEmoji: Record<string, string> = {
  cleanup: '🏖️',
  planting: '🌳',
  workshop: '♻️',
  recycling: '📦',
  awareness: '📢',
};

export default function MissionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: mission, isLoading, isError, error } = useMission(id);
  const registerMutation = useRegisterMission();
  const cancelMutation = useCancelParticipation();
  const insets = useSafeAreaInsets();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRegister = async () => {
    try {
      await registerMutation.mutateAsync(id);
      Toast.show({
        type: 'success',
        text1: 'Inscription confirmée !',
        text2: 'Vous êtes inscrit à cette mission.',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: "Erreur d'inscription",
        text2: error instanceof Error ? error.message : "Une erreur est survenue",
      });
    }
  };

  const handleCancel = async () => {
    if (!mission?.userParticipationId) return;
    try {
      await cancelMutation.mutateAsync({
        participationId: mission.userParticipationId!,
        missionId: id,
      });
      Toast.show({
        type: 'info',
        text1: 'Participation annulée',
        text2: 'Vous pouvez vous réinscrire à tout moment.',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: "Erreur d'annulation",
        text2: error instanceof Error ? error.message : "Une erreur est survenue",
      });
    }
  };

  if (isLoading) return <LoadingSpinner message="Chargement de la mission..." />;

  if (isError || !mission) {
    return (
      <ErrorMessage
        message={error instanceof Error ? error.message : 'Mission introuvable'}
        onRetry={() => router.back()}
      />
    );
  }

  const placesLeft = mission.max_participants - mission.current_participants;
  const isFull = placesLeft === 0;
  // isCancelled = had a participation but it's cancelled (not currently registered)
  const isCancelled = !mission.isUserRegistered && !!mission.userParticipationId;

  return (
    <View style={{ flex: 1, backgroundColor: '#111827' }}>
      <ScrollView style={{ flex: 1 }}>
        {/* Hero */}
        <View style={{ backgroundColor: '#065f46', height: 192, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 72 }}>{categoryEmoji[mission.category] ?? '🌿'}</Text>
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
          {/* Category badge */}
          <View style={{
            backgroundColor: 'rgba(16,185,129,0.15)',
            paddingHorizontal: 16, paddingVertical: 8,
            borderRadius: 999, alignSelf: 'flex-start', marginBottom: 16,
            borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)',
          }}>
            <Text style={{ color: '#10b981', fontWeight: '600' }}>
              {categoryLabels[mission.category]}
            </Text>
          </View>

          {/* Title */}
          <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 12 }}>
            {mission.title}
          </Text>

          {/* Description */}
          <Text style={{ color: '#d1d5db', fontSize: 15, lineHeight: 24, marginBottom: 24 }}>
            {mission.description}
          </Text>

          {/* Cancelled notice */}
          {isCancelled && (
            <View style={{
              backgroundColor: 'rgba(239,68,68,0.1)',
              borderWidth: 1, borderColor: '#ef4444',
              borderRadius: 12, padding: 16, marginBottom: 16,
              flexDirection: 'row', alignItems: 'center', gap: 10,
            }}>
              <Text style={{ fontSize: 20 }}>❌</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#f87171', fontWeight: '700', marginBottom: 2 }}>
                  Inscription annulée
                </Text>
                <Text style={{ color: '#9ca3af', fontSize: 13 }}>
                  Vous avez annulé votre participation. Vous pouvez vous réinscrire ci-dessous.
                </Text>
              </View>
            </View>
          )}

          {/* Enrolled badge */}
          {mission.isUserRegistered && (
            <View style={{
              backgroundColor: 'rgba(16,185,129,0.1)',
              borderWidth: 1, borderColor: '#10b981',
              borderRadius: 12, padding: 16, marginBottom: 16,
            }}>
              <Text style={{ color: '#10b981', fontWeight: '600', textAlign: 'center' }}>
                ✓ Vous êtes inscrit à cette mission
              </Text>
            </View>
          )}

          {/* Details */}
          <View style={{
            backgroundColor: '#1f2937', borderRadius: 16, padding: 16,
            marginBottom: 24, borderWidth: 1, borderColor: '#374151',
          }}>
            {[
              { icon: '📅', label: 'Date et heure', value: formatDate(mission.date) },
              { icon: '📍', label: 'Lieu', value: mission.location },
              { icon: '⏱️', label: 'Durée', value: `${mission.duration_hours} ${mission.duration_hours === 1 ? 'heure' : 'heures'}` },
            ].map((row, i, arr) => (
              <View key={i} style={{
                flexDirection: 'row', alignItems: 'flex-start',
                paddingVertical: 12,
                borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                borderBottomColor: '#374151',
              }}>
                <Text style={{ fontSize: 20, marginRight: 12 }}>{row.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>{row.label}</Text>
                  <Text style={{ color: '#f9fafb', fontWeight: '600' }}>{row.value}</Text>
                </View>
              </View>
            ))}

            <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingTop: 12 }}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>👥</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>Participants</Text>
                <Text style={{ fontWeight: '600', color: isFull ? '#f87171' : '#10b981' }}>
                  {mission.current_participants}/{mission.max_participants} inscrits
                  {!isFull && ` • ${placesLeft} ${placesLeft === 1 ? 'place restante' : 'places restantes'}`}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action button */}
      <View style={{
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: insets.bottom + 12,
        backgroundColor: '#111827',
        borderTopWidth: 1,
        borderTopColor: '#1f2937',
      }}>
        {mission.isUserRegistered ? (
          <Button
            title="Annuler ma participation"
            onPress={handleCancel}
            variant="danger"
            fullWidth
            loading={cancelMutation.isPending}
          />
        ) : isCancelled ? (
          // Re-enroll button for cancelled missions
          <Button
            title={isFull ? 'Mission complète' : "🔄  Se réinscrire"}
            onPress={handleRegister}
            fullWidth
            disabled={isFull}
            loading={registerMutation.isPending}
          />
        ) : (
          <Button
            title={isFull ? 'Mission complète' : "S'inscrire"}
            onPress={handleRegister}
            fullWidth
            disabled={isFull}
            loading={registerMutation.isPending}
          />
        )}
      </View>
    </View>
  );
}