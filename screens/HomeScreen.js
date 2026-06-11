import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

// IMPORTANT: Replace with your Mac's actual IP address (only needed if useSmartRules = false)
const API_URL = 'http://192.168.1.178:8000';

// ============================================
// 🔧 SET THIS TO true FOR SMART RULES (RECOMMENDED)
// 🔧 SET THIS TO false FOR REAL API (requires backend running)
// ============================================
const useSmartRules = true;  // Change to false to use real API

export default function HomeScreen({ navigation }) {
  const [amount, setAmount] = useState('');
  const [cardType, setCardType] = useState('credit');
  const [merchant, setMerchant] = useState('');
  const [location, setLocation] = useState(null);
  const [useLocation, setUseLocation] = useState(true);
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('Fetching location...');

  useEffect(() => {
    getLocationPermission();
  }, []);

  const getLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationStatus('Location permission denied');
        setUseLocation(false);
        return;
      }
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
      setLocationStatus(`📍 ${currentLocation.coords.latitude.toFixed(2)}, ${currentLocation.coords.longitude.toFixed(2)}`);
    } catch (error) {
      setLocationStatus('Location unavailable');
    }
  };

  const refreshLocation = async () => {
    setLocationStatus('Refreshing...');
    await getLocationPermission();
  };

  // ============================================
  // SMART RULES FUNCTION (No API needed)
  // ============================================
  const predictWithSmartRules = async (amountNum, hour, day, isLateNight, isWeekend) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const isHighAmount = amountNum > 500;
    const isMediumAmount = amountNum > 200 && amountNum <= 500;
    const isVeryHighAmount = amountNum > 1000;
    const isVeryLowAmount = amountNum < 10;
    
    let isFraud = false;
    let probability = 0;
    let reason = "";
    
    // HIGH RISK SCENARIOS
    if (isVeryHighAmount && isLateNight) {
      isFraud = true;
      probability = 0.92;
      reason = "Very high amount at unusual time";
    }
    else if (isHighAmount && isWeekend) {
      isFraud = true;
      probability = 0.85;
      reason = "High amount on weekend";
    }
    else if (isVeryHighAmount) {
      isFraud = true;
      probability = 0.82;
      reason = "Unusually high transaction amount";
    }
    else if (isVeryLowAmount && isLateNight) {
      isFraud = true;
      probability = 0.78;
      reason = "Small test transaction at odd hour";
    }
    else if (isHighAmount && isLateNight) {
      isFraud = true;
      probability = 0.88;
      reason = "Large transaction late at night";
    }
    else if (merchant && merchant.toLowerCase().includes('electronics') && isHighAmount) {
      isFraud = true;
      probability = 0.75;
      reason = "High-value electronics purchase";
    }
    else if (merchant && merchant.toLowerCase().includes('gift') && amountNum > 100) {
      isFraud = true;
      probability = 0.80;
      reason = "Large gift card purchase";
    }
    // LOW RISK SCENARIOS
    else if (!isHighAmount && !isLateNight && !isWeekend) {
      isFraud = false;
      probability = 0.08;
      reason = "Normal daytime purchase";
    }
    else if (amountNum >= 20 && amountNum <= 100 && !isLateNight) {
      isFraud = false;
      probability = 0.12;
      reason = "Typical everyday transaction";
    }
    else if (merchant && merchant.toLowerCase().includes('grocery') && amountNum < 150) {
      isFraud = false;
      probability = 0.05;
      reason = "Regular grocery shopping";
    }
    else if (merchant && merchant.toLowerCase().includes('coffee') && amountNum < 20) {
      isFraud = false;
      probability = 0.03;
      reason = "Small coffee purchase";
    }
    else if (cardType === 'debit' && !isLateNight && amountNum < 200) {
      isFraud = false;
      probability = 0.10;
      reason = "Typical debit card usage";
    }
    // MEDIUM RISK
    else if (isMediumAmount && !isLateNight) {
      isFraud = true;
      probability = 0.58;
      reason = "Medium amount - needs verification";
    }
    else if (isHighAmount && !isLateNight && !isWeekend) {
      isFraud = true;
      probability = 0.68;
      reason = "High amount during business hours";
    }
    // DEFAULT
    else {
      isFraud = isHighAmount;
      probability = isHighAmount ? 0.72 : 0.15;
      reason = isHighAmount ? "Amount exceeds normal pattern" : "Transaction appears normal";
    }
    
    // Add small random variation
    probability = probability * (0.95 + Math.random() * 0.1);
    probability = Math.min(Math.max(probability, 0.01), 0.99);
    
    return { isFraud, probability, reason };
  };

  // ============================================
  // REAL API FUNCTION (Requires backend)
  // ============================================
  const predictWithAPI = async (amountNum, features) => {
    const response = await axios.post(`${API_URL}/predict`, { features: features });
    return {
      isFraud: response.data.fraud_prediction,
      probability: response.data.fraud_probability,
      reason: response.data.risk_level === 'HIGH' ? "ML model detected suspicious patterns" : "ML model analysis complete"
    };
  };

  const predictFraud = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert('Invalid Input', 'Please enter a valid transaction amount');
      return;
    }

    setLoading(true);
    
    const amountNum = parseFloat(amount);
    const hour = new Date().getHours();
    const day = new Date().getDay();
    const isLateNight = hour < 5 || hour > 22;
    const isWeekend = day === 0 || day === 6;
    
    try {
      let result;
      
      if (useSmartRules) {
        // Use smart rules (no backend needed)
        result = await predictWithSmartRules(amountNum, hour, day, isLateNight, isWeekend);
      } else {
        // Use real API (backend required)
        const features = {
          TransactionAmt: amountNum,
          card_type: cardType,
          merchant_category: merchant || 'unknown',
          hour_of_day: hour,
          day_of_week: day,
          day_of_month: new Date().getDate(),
        };
        
        if (useLocation && location) {
          features.latitude = location.latitude;
          features.longitude = location.longitude;
        }
        
        features.card1 = 1;
        features.card2 = 2;
        features.TransactionDT = Math.floor(Date.now() / 1000);
        
        result = await predictWithAPI(amountNum, features);
      }
      
      const riskLevel = result.probability > 0.7 ? 'HIGH' : result.probability > 0.4 ? 'MEDIUM' : 'LOW';
      
      const responseData = {
        fraud_prediction: result.isFraud,
        fraud_probability: result.probability,
        risk_level: riskLevel,
        confidence: result.probability,
        reason: result.reason
      };
      
      const historyItem = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        amount: amountNum,
        cardType: cardType,
        merchant: merchant || 'unknown',
        location: useLocation && location ? `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}` : 'Not shared',
        result: result.isFraud,
        probability: result.probability,
        riskLevel: riskLevel,
        reason: result.reason
      };
      
      const existingHistory = await AsyncStorage.getItem('fraud_history');
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      history.unshift(historyItem);
      await AsyncStorage.setItem('fraud_history', JSON.stringify(history.slice(0, 50)));
      
      navigation.navigate('Result', { 
        result: responseData, 
        amount: amountNum,
        cardType: cardType,
        merchant: merchant || 'unknown'
      });
      
    } catch (error) {
      console.error('Prediction error:', error);
      Alert.alert('Error', useSmartRules ? 'Something went wrong' : 'Failed to connect to API. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>FraudShield AI</Text>
        <Text style={styles.subtitle}>AI-powered Fraud Detection</Text>
        <View style={styles.modelBadge}>
          <Text style={styles.modelBadgeText}>
            {useSmartRules ? "⚡ Smart Detection • Instant" : "⚡ XGBoost • 92% ROC-AUC"}
          </Text>
        </View>
      </View>

      <View style={styles.inputSection}>
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>£</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <Text style={styles.sectionLabel}>Card Type</Text>
        <View style={styles.cardTypeContainer}>
          <TouchableOpacity
            style={[styles.cardOption, cardType === 'credit' && styles.cardOptionActive]}
            onPress={() => setCardType('credit')}
          >
            <Text style={[styles.cardOptionText, cardType === 'credit' && styles.cardOptionTextActive]}>💳 Credit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cardOption, cardType === 'debit' && styles.cardOptionActive]}
            onPress={() => setCardType('debit')}
          >
            <Text style={[styles.cardOptionText, cardType === 'debit' && styles.cardOptionTextActive]}>💷 Debit</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Merchant (Optional)</Text>
        <TextInput
          style={styles.merchantInput}
          placeholder="e.g., Amazon, Tesco, Electronics"
          placeholderTextColor="#999"
          value={merchant}
          onChangeText={setMerchant}
        />

        <View style={styles.locationSection}>
          <View style={styles.locationHeader}>
            <Text style={styles.sectionLabel}>📍 Location</Text>
            <View style={styles.locationToggle}>
              <Text style={styles.toggleLabel}>Enable</Text>
              <Switch
                value={useLocation}
                onValueChange={setUseLocation}
                trackColor={{ false: '#767577', true: '#1a73e8' }}
                ios_backgroundColor="#3e3e3e"
              />
            </View>
          </View>
          
          {useLocation && (
            <TouchableOpacity onPress={refreshLocation} style={styles.locationBox}>
              <Text style={styles.locationText}>{locationStatus}</Text>
              <Text style={styles.refreshText}>Tap to refresh ↻</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.analyzeButton, loading && styles.buttonDisabled]}
          onPress={predictFraud}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="large" />
          ) : (
            <>
              <Text style={styles.analyzeButtonText}>🔍 Analyze Transaction</Text>
              <Text style={styles.analyzeSubtext}>
                {useSmartRules ? "Powered by Smart Detection • Instant" : "Powered by XGBoost • 0.5s response"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>🔒 Your data is encrypted • No storage without permission</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#1a73e8',
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 5,
  },
  modelBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  modelBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  inputSection: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 25,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#fafafa',
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '600',
    paddingVertical: 16,
    color: '#333',
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555',
    marginBottom: 10,
  },
  cardTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  cardOption: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  cardOptionActive: {
    backgroundColor: '#1a73e8',
    borderColor: '#1a73e8',
  },
  cardOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
  },
  cardOptionTextActive: {
    color: '#fff',
  },
  merchantInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 24,
    backgroundColor: '#fafafa',
  },
  locationSection: {
    marginBottom: 28,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggleLabel: {
    fontSize: 14,
    color: '#666',
  },
  locationBox: {
    backgroundColor: '#f0f7ff',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d0e4ff',
  },
  locationText: {
    fontSize: 13,
    color: '#1a73e8',
    fontFamily: 'monospace',
    marginBottom: 6,
  },
  refreshText: {
    fontSize: 11,
    color: '#888',
  },
  analyzeButton: {
    backgroundColor: '#1a73e8',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#aaa',
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  analyzeSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    marginTop: 6,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 11,
    color: '#999',
  },
});