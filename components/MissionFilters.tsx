import { MISSION_CATEGORIES } from '@/constants/categories';
import { MissionCategory } from '@/types/mission.types';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface MissionFiltersProps {
  selectedCategory?: MissionCategory;
  onSelectCategory: (category?: MissionCategory) => void;
}

export function MissionFilters({ selectedCategory, onSelectCategory }: MissionFiltersProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {/* All Categories */}
      <TouchableOpacity
        style={[
          styles.filterButton,
          !selectedCategory && styles.filterButtonActive,
        ]}
        onPress={() => onSelectCategory(undefined)}
      >
        <Text
          style={[
            styles.filterText,
            !selectedCategory && styles.filterTextActive,
          ]}
        >
          All
        </Text>
      </TouchableOpacity>

      {/* Category Filters */}
      {MISSION_CATEGORIES.map((category) => (
        <TouchableOpacity
          key={category.value}
          style={[
            styles.filterButton,
            selectedCategory === category.value && styles.filterButtonActive,
          ]}
          onPress={() => onSelectCategory(category.value)}
        >
          <Text style={styles.emoji}>{category.emoji}</Text>
          <Text
            style={[
              styles.filterText,
              selectedCategory === category.value && styles.filterTextActive,
            ]}
          >
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#2C2C2E',
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  emoji: {
    fontSize: 16,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
});