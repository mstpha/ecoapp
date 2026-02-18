import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#8E8E93',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0A0A0A',
          borderTopColor: '#2C2C2E',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 68,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="🌍" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-missions"
        options={{
          title: 'My Missions',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="📅" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="👤" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}


function TabBarIcon({ name, color }: { name: string; color: string }) {
  return (
    <Text
      style={{
        fontSize: 24,
        opacity: color === '#10B981' ? 1 : 0.5,
      }}
    >
      {name}
    </Text>
  );
}
