import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MissionCard } from '@/components/MissionCard';
import { MissionFilters } from '@/components/MissionFilters';
import { SearchBar } from '@/components/SearchBar';
import { useMissions } from '@/hooks/useMissions';
import { MissionCategory } from '@/types/mission.types';
import React, { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

export default function ExploreScreen() {
  const [selectedCategory, setSelectedCategory] = useState<MissionCategory | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: missions, isLoading, isError, refetch } = useMissions({
    category: selectedCategory,
    search: searchQuery,
  });

  if (isLoading) {
    return <LoadingSpinner message="Loading missions..." />;
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <EmptyState
          emoji="❌"
          title="Error loading missions"
          message="Please try again later"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Discover</Text>
            <Text style={styles.title}>Environmental Missions</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🌍</Text>
          </View>
        </View>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search missions..."
        />
      </View>

      {/* Filters */}
      <MissionFilters
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Mission List */}
      <FlatList
        data={missions || []}
        renderItem={({ item }) => <MissionCard mission={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor="#10B981"
          />
        }
        ListEmptyComponent={
          <EmptyState
            emoji="🔍"
            title="No missions found"
            message="Try adjusting your filters or search query"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    backgroundColor: '#0A0A0A',
    paddingTop: 60,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  greeting: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 24,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
});