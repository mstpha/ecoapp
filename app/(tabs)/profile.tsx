import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/context/Authcontext';
import { useProfile, useUserStats } from '@/hooks/useProfile';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Toast.show({
      type: 'info',
      text1: 'Déconnexion',
      text2: 'Appuyez pour confirmer',
      onPress: async () => {
        Toast.hide();
        await signOut();
        router.replace('/login');
      },
      visibilityTime: 5000,
    });
  };

  if (profileLoading || statsLoading) {
    return <LoadingSpinner message="Chargement du profil..." />;
  }

  const hours = stats?.total_hours_volunteered ?? 0;

  const statCards = [
    {
      icon: '✅',
      value: String(stats?.total_missions_completed ?? 0),
      label: 'Missions\ncomplétées',
      color: '#10b981',
    },
    {
      icon: '📋',
      value: String(stats?.enrolled_missions_count ?? 0),
      label: 'Inscriptions\nactives',
      color: '#10b981',
    },
    {
      icon: '⏳',
      value: String(stats?.upcoming_missions_count ?? 0),
      label: 'Missions\nà venir',
      color: '#10b981',
    },
    {
      icon: '🌍',
      // Impact = hours volunteered. Show hours or a motivating message if 0
      value: hours > 0 ? `${hours}h` : '0h',
      label: 'Heures\nbénévoles',
      color: hours > 0 ? '#10b981' : '#6b7280',
      subtitle: hours > 0 ? `Impact positif !` : 'Rejoignez une mission',
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#111827' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      >
        {/* Header */}
        <View style={{
          backgroundColor: '#065f46',
          paddingHorizontal: 24,
          paddingTop: insets.top + 24,
          paddingBottom: 32,
        }}>
          <View style={{ alignItems: 'center' }}>
            <View style={{
              width: 96, height: 96, borderRadius: 48,
              backgroundColor: 'rgba(255,255,255,0.15)',
              alignItems: 'center', justifyContent: 'center', marginBottom: 16,
              borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
            }}>
              <Text style={{ fontSize: 48 }}>👤</Text>
            </View>
            <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 4 }}>
              {profile?.full_name || 'Utilisateur'}
            </Text>
            <Text style={{ color: '#6ee7b7' }}>{user?.email}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8 }}>
          <Text style={{ color: '#f9fafb', fontSize: 18, fontWeight: 'bold', marginBottom: 16, paddingHorizontal: 8 }}>
            Mes Statistiques
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {statCards.map((card, i) => (
              <View key={i} style={{ width: '50%', padding: 8 }}>
                <View style={{
                  backgroundColor: '#1f2937',
                  borderRadius: 16, padding: 16,
                  borderWidth: 1, borderColor: '#374151',
                }}>
                  <Text style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</Text>
                  <Text style={{ fontSize: 26, fontWeight: 'bold', color: card.color, marginBottom: 2 }}>
                    {card.value}
                  </Text>
                  <Text style={{ color: '#9ca3af', fontSize: 12, lineHeight: 18 }}>
                    {card.label}
                  </Text>
                  {card.subtitle && (
                    <Text style={{ color: '#6b7280', fontSize: 11, marginTop: 4 }}>
                      {card.subtitle}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Info */}
        <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 }}>
          <Text style={{ color: '#f9fafb', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
            Informations
          </Text>

          <View style={{
            backgroundColor: '#1f2937', borderRadius: 16, padding: 16,
            marginBottom: 16, borderWidth: 1, borderColor: '#374151',
          }}>
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12, paddingBottom: 12,
              borderBottomWidth: 1, borderBottomColor: '#374151',
            }}>
              <Text style={{ color: '#9ca3af' }}>📧 Email</Text>
              <Text style={{ color: '#f9fafb', fontWeight: '500', flexShrink: 1, marginLeft: 8, textAlign: 'right' }} numberOfLines={1}>
                {user?.email}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: '#9ca3af' }}>🆔 ID</Text>
              <Text style={{ color: '#6b7280', fontSize: 12 }}>
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
    </View>
  );
}