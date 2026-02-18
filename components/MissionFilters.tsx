import { MISSION_CATEGORIES } from '@/constants/categories';
import { MissionCategory } from '@/types/mission.types';
import React from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';

interface MissionFiltersProps {
  selectedCategory?: MissionCategory;
  onSelectCategory: (category?: MissionCategory) => void;
}

export function MissionFilters({ selectedCategory, onSelectCategory }: MissionFiltersProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
      }}
    >
      {/* All */}
      <TouchableOpacity
        onPress={() => onSelectCategory(undefined)}
        style={{
          height: 40,
          paddingHorizontal: 18,
          borderRadius: 20,
          backgroundColor: !selectedCategory ? '#10B981' : '#1f2937',
          borderWidth: 1,
          borderColor: !selectedCategory ? '#10B981' : '#374151',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{
          fontSize: 14,
          fontWeight: '700',
          color: !selectedCategory ? '#ffffff' : '#d1d5db',
        }}>
          Tout
        </Text>
      </TouchableOpacity>

      {MISSION_CATEGORIES.map((category) => {
        const isActive = selectedCategory === category.value;
        return (
          <TouchableOpacity
            key={category.value}
            onPress={() => onSelectCategory(category.value)}
            style={{
              height: 40,
              paddingHorizontal: 18,
              borderRadius: 20,
              backgroundColor: isActive ? '#10B981' : '#1f2937',
              borderWidth: 1,
              borderColor: isActive ? '#10B981' : '#374151',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Text style={{ fontSize: 15, lineHeight: 20 }}>{category.emoji}</Text>
            <Text style={{
              fontSize: 14,
              fontWeight: '700',
              color: isActive ? '#ffffff' : '#d1d5db',
              lineHeight: 20,
            }}>
              {category.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}