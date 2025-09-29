import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TodayScreen } from '@screens/Today/TodayScreen';
import { ScheduledScreen } from '@screens/Scheduled/ScheduledScreen';
import { AllTasksScreen } from '@screens/AllTasks/AllTasksScreen';
import { AlarmSetsScreen } from '@screens/AlarmSets/AlarmSetsScreen';
import { SettingsScreen } from '@screens/Settings/SettingsScreen';
import { TaskDetailScreen } from '@screens/AllTasks/TaskDetailScreen';
import { TaskEditorScreen } from '@screens/AllTasks/TaskEditorScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabNavigator = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Today" component={TodayScreen} />
    <Tab.Screen name="Scheduled" component={ScheduledScreen} />
    <Tab.Screen name="All" component={AllTasksScreen} />
    <Tab.Screen name="AlarmSets" component={AlarmSetsScreen} options={{ title: 'Alarm Sets' }} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

export const RootNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Home" component={TabNavigator} options={{ headerShown: false }} />
    <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Task Detail' }} />
    <Stack.Screen name="TaskEditor" component={TaskEditorScreen} options={{ title: 'Task' }} />
  </Stack.Navigator>
);
