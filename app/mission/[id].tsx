import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
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

export default function MissionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: mission, isLoading, isError, error } = useMission(id);
  const registerMutation = useRegisterMission();
  const cancelMutation = useCancelParticipation();

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

  const handleRegister = () => {
    Alert.alert(
      'Inscription',
      'Voulez-vous vous inscrire à cette mission ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              await registerMutation.mutateAsync(id);
              Alert.alert('Succès', 'Vous êtes inscrit à cette mission !');
            } catch (error) {
              Alert.alert(
                'Erreur',
                error instanceof Error ? error.message : "Erreur lors de l'inscription"
              );
            }
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    if (!mission?.userParticipationId) return;

    Alert.alert(
      'Annulation',
      'Voulez-vous annuler votre participation à cette mission ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelMutation.mutateAsync({
                participationId: mission.userParticipationId!,
                missionId: id,
              });
              Alert.alert('Annulé', 'Votre participation a été annulée');
            } catch (error) {
              Alert.alert(
                'Erreur',
                error instanceof Error ? error.message : "Erreur lors de l'annulation"
              );
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return <LoadingSpinner message="Chargement de la mission..." />;
  }

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

  return (
    <View className="flex-1 bg-gray-900">
      <ScrollView className="flex-1">
        {/* Header Image Placeholder */}
        <View className="bg-green-600 h-48 items-center justify-center">
          <Text className="text-7xl">
            {mission.category === 'cleanup' && '🏖️'}
            {mission.category === 'planting' && '🌳'}
            {mission.category === 'workshop' && '♻️'}
            {mission.category === 'recycling' && '📦'}
            {mission.category === 'awareness' && '📢'}
          </Text>
        </View>

        {/* Content */}
        <View className="px-6 py-6">
          {/* Category Badge */}
          <View className="bg-green-500/20 px-4 py-2 rounded-full self-start mb-4">
            <Text className="text-green-400 font-semibold">
              {categoryLabels[mission.category]}
            </Text>
          </View>

          {/* Title */}
          <Text className="text-3xl font-bold text-white mb-4">
            {mission.title}
          </Text>

          {/* Description */}
          <Text className="text-gray-300 text-base leading-6 mb-6">
            {mission.description}
          </Text>

          {/* Details */}
          <View className="bg-gray-800 rounded-xl p-4 mb-6">
            <View className="flex-row items-start mb-3 pb-3 border-b border-gray-700">
              <Text className="text-2xl mr-3">📅</Text>
              <View className="flex-1">
                <Text className="text-gray-400 text-sm">Date et heure</Text>
                <Text className="text-white font-semibold mt-1">
                  {formatDate(mission.date)}
                </Text>
              </View>
            </View>

            <View className="flex-row items-start mb-3 pb-3 border-b border-gray-700">
              <Text className="text-2xl mr-3">📍</Text>
              <View className="flex-1">
                <Text className="text-gray-400 text-sm">Lieu</Text>
                <Text className="text-white font-semibold mt-1">
                  {mission.location}
                </Text>
              </View>
            </View>

            <View className="flex-row items-start mb-3 pb-3 border-b border-gray-700">
              <Text className="text-2xl mr-3">⏱️</Text>
              <View className="flex-1">
                <Text className="text-gray-400 text-sm">Durée</Text>
                <Text className="text-white font-semibold mt-1">
                  {mission.duration_hours} {mission.duration_hours === 1 ? 'heure' : 'heures'}
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <Text className="text-2xl mr-3">👥</Text>
              <View className="flex-1">
                <Text className="text-gray-400 text-sm">Participants</Text>
                <Text
                  className={`font-semibold mt-1 ${
                    isFull ? 'text-red-400' : 'text-green-400'
                  }`}
                >
                  {mission.current_participants}/{mission.max_participants} inscrits
                  {!isFull && ` • ${placesLeft} ${placesLeft === 1 ? 'place restante' : 'places restantes'}`}
                </Text>
              </View>
            </View>
          </View>

          {/* Registration Status */}
          {mission.isUserRegistered && (
            <View className="bg-green-500/20 border border-green-500 rounded-xl p-4 mb-4">
              <Text className="text-green-400 font-semibold text-center">
                ✓ Vous êtes inscrit à cette mission
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Button */}
      <View className="px-6 py-4 bg-gray-900 border-t border-gray-800">
        {mission.isUserRegistered ? (
          <Button
            title="Annuler ma participation"
            onPress={handleCancel}
            variant="danger"
            fullWidth
            loading={cancelMutation.isPending}
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