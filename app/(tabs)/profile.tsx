import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/context/Authcontext';
import { useProfile, useUserStats } from '@/hooks/useProfile';
import { router } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: stats, isLoading: statsLoading } = useUserStats();

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/login');
          },
        },
      ]
    );
  };

  if (profileLoading || statsLoading) {
    return <LoadingSpinner message="Chargement du profil..." />;
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary-600 px-6 py-8">
        <View className="items-center">
          <View className="w-24 h-24 rounded-full bg-white items-center justify-center mb-4">
            <Text className="text-5xl">👤</Text>
          </View>
          <Text className="text-white text-2xl font-bold mb-1">
            {profile?.full_name || 'Utilisateur'}
          </Text>
          <Text className="text-primary-100">{user?.email}</Text>
        </View>
      </View>

      {/* Statistics Cards */}
      <View className="px-6 py-6">
        <Text className="text-gray-900 text-xl font-bold mb-4">
          Mes Statistiques
        </Text>

        <View className="flex-row flex-wrap -mx-2">
          {/* Missions Completed */}
          <View className="w-1/2 px-2 mb-4">
            <View className="bg-white rounded-xl p-4 shadow-sm">
              <Text className="text-4xl mb-2">✅</Text>
              <Text className="text-3xl font-bold text-gray-900">
                {stats?.total_missions_completed ?? 0}
              </Text>
              <Text className="text-gray-600 text-sm">
                Missions{'\n'}complétées
              </Text>
            </View>
          </View>

          {/* Missions Registered */}
          <View className="w-1/2 px-2 mb-4">
            <View className="bg-white rounded-xl p-4 shadow-sm">
              <Text className="text-4xl mb-2">📋</Text>
              <Text className="text-3xl font-bold text-gray-900">
                {stats?.enrolled_missions_count ?? 0}
              </Text>
              <Text className="text-gray-600 text-sm">
                Inscriptions{'\n'}actives
              </Text>
            </View>
          </View>

          {/* Upcoming Missions */}
          <View className="w-1/2 px-2 mb-4">
            <View className="bg-white rounded-xl p-4 shadow-sm">
              <Text className="text-4xl mb-2">⏳</Text>
              <Text className="text-3xl font-bold text-gray-900">
                {stats?.upcoming_missions_count ?? 0}
              </Text>
              <Text className="text-gray-600 text-sm">
                Missions{'\n'}à venir
              </Text>
            </View>
          </View>

          {/* Impact */}
          <View className="w-1/2 px-2 mb-4">
            <View className="bg-white rounded-xl p-4 shadow-sm">
              <Text className="text-4xl mb-2">🌍</Text>
              <Text className="text-3xl font-bold text-primary-600">
                {(stats?.total_missions_completed ?? 0) > 0 ? '🎉' : '🚀'}
              </Text>
              <Text className="text-gray-600 text-sm">
                Impact{'\n'}environnemental
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View className="px-6 pb-8">
        <Text className="text-gray-900 text-xl font-bold mb-4">Actions</Text>

        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-700">📧 Email</Text>
            <Text className="text-gray-900 font-medium">{user?.email}</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-700">🆔 ID Utilisateur</Text>
            <Text className="text-gray-500 text-xs">
              {user?.id.substring(0, 8)}...
            </Text>
          </View>
        </View>

        <Button
          title="Se déconnecter"
          onPress={handleLogout}
          variant="danger"
          fullWidth
        />
      </View>
    </ScrollView>
  );
}
