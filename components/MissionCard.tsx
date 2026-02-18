import { getCategoryInfo } from '@/constants/categories';
import { Mission } from '@/types/mission.types';
import { getRelativeTime } from '@/utils/date';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MissionCardProps {
  mission: Mission;
}

export function MissionCard({ mission }: MissionCardProps) {
  const router = useRouter();
  const categoryInfo = getCategoryInfo(mission.category);
  const spotsLeft = mission.max_participants - mission.current_participants;
  const isFull = spotsLeft <= 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/mission/${mission.id}`)}
      activeOpacity={0.8}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        {mission.image_url ? (
          <Image
            source={{ uri: mission.image_url }}
            style={[styles.image, { objectFit: 'cover' }]}
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: categoryInfo.color }]}>
            <Text style={styles.categoryEmoji}>{categoryInfo.emoji}</Text>
          </View>
        )}

        {/* Category Badge */}
        <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.color }]}>
          <Text style={styles.categoryText}>{categoryInfo.emoji} {categoryInfo.label}</Text>
        </View>

        {/* Full Badge */}
        {isFull && (
          <View style={styles.fullBadge}>
            <Text style={styles.fullText}>FULL</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {mission.title}
        </Text>

        <Text style={styles.description} numberOfLines={2}>
          {mission.description}
        </Text>

        {/* Info Row */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>📍</Text>
            <Text style={styles.infoText} numberOfLines={1}>
              {mission.location}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>📅</Text>
            <Text style={styles.infoText}>
              {getRelativeTime(mission.date)}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>⏱️</Text>
            <Text style={styles.infoText}>
              {mission.duration_hours}h
            </Text>
          </View>
        </View>

        {/* Participants */}
        <View style={styles.participantsBar}>
          <View style={styles.participantsInfo}>
            <Text style={styles.participantsIcon}>👥</Text>
            <Text style={styles.participantsText}>
              {mission.current_participants} / {mission.max_participants} participants
            </Text>
          </View>

          {!isFull && (
            <Text style={styles.spotsLeft}>
              {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  imageContainer: {
    height: 160,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 48,
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  fullBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  fullText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  participantsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  participantsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  participantsText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  spotsLeft: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
});