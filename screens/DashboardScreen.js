import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const [stats, setStats] = useState({
    total: 0,
    fraudCount: 0,
    legitCount: 0,
    fraudRate: 0,
    avgRiskScore: 0,
    highRiskCount: 0,
  });

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const saved = await AsyncStorage.getItem('fraud_history');
      if (saved) {
        const history = JSON.parse(saved);
        const fraudCount = history.filter(item => item.result === true).length;
        const legitCount = history.filter(item => item.result === false).length;
        const highRiskCount = history.filter(item => item.riskLevel === 'HIGH').length;
        const avgRiskScore = history.reduce((sum, item) => sum + item.probability, 0) / (history.length || 1);

        setStats({
          total: history.length,
          fraudCount,
          legitCount,
          fraudRate: history.length ? (fraudCount / history.length) * 100 : 0,
          avgRiskScore: (avgRiskScore * 100).toFixed(1),
          highRiskCount,
        });
      }
    } catch (error) {
      console.log('Error loading stats:', error);
    }
  };

  const statCards = [
    { label: 'Total Scans', value: stats.total, icon: '🔄', color: '#1a73e8' },
    { label: 'Fraud Detected', value: stats.fraudCount, icon: '⚠️', color: '#d93025' },
    { label: 'Legit Transactions', value: stats.legitCount, icon: '✅', color: '#34a853' },
    { label: 'Fraud Rate', value: `${stats.fraudRate.toFixed(1)}%`, icon: '📊', color: '#f9ab00' },
    { label: 'Avg Risk Score', value: `${stats.avgRiskScore}%`, icon: '🎯', color: '#9334e8' },
    { label: 'High Risk Alerts', value: stats.highRiskCount, icon: '🔴', color: '#d93025' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1a73e8" />
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analytics Dashboard</Text>
          <Text style={styles.headerSubtitle}>Real-time Fraud Statistics</Text>
        </View>

        <View style={styles.statsGrid}>
          {statCards.map((card, index) => (
            <View key={index} style={[styles.statCard, { borderTopColor: card.color }]}>
              <Text style={styles.statIcon}>{card.icon}</Text>
              <Text style={styles.statValue}>{card.value}</Text>
              <Text style={styles.statLabel}>{card.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.modelInfo}>
          <Text style={styles.modelTitle}>🤖 Model Information</Text>
          <View style={styles.modelRow}>
            <Text style={styles.modelLabel}>Model:</Text>
            <Text style={styles.modelValue}>XGBoost</Text>
          </View>
          <View style={styles.modelRow}>
            <Text style={styles.modelLabel}>ROC-AUC:</Text>
            <Text style={styles.modelValue}>92.38%</Text>
          </View>
          <View style={styles.modelRow}>
            <Text style={styles.modelLabel}>Fraud Recall:</Text>
            <Text style={styles.modelValue}>80%</Text>
          </View>
          <View style={styles.modelRow}>
            <Text style={styles.modelLabel}>Features:</Text>
            <Text style={styles.modelValue}>435</Text>
          </View>
          <View style={styles.modelRow}>
            <Text style={styles.modelLabel}>Training Samples:</Text>
            <Text style={styles.modelValue}>472,432</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a73e8',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    backgroundColor: '#1a73e8',
    paddingTop: 20,
    paddingBottom: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
    marginTop: 10,
  },
  statCard: {
    width: (width - 40) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
    borderTopWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  modelInfo: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  modelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#1a73e8',
  },
  modelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modelLabel: {
    fontSize: 14,
    color: '#666',
  },
  modelValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a73e8',
  },
});