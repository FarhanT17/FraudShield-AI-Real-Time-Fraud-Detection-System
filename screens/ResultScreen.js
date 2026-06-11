import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
} from 'react-native';

export default function ResultScreen({ route, navigation }) {
  const { result, amount, cardType, merchant } = route.params;

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'HIGH': return '#d93025';
      case 'MEDIUM': return '#f9ab00';
      default: return '#34a853';
    }
  };

  const shareResult = async () => {
    try {
      let shareMessage = `FraudShield AI Analysis:\n\n`;
      shareMessage += `💰 Amount: £${amount}\n`;
      shareMessage += `💳 Card Type: ${cardType || 'Not specified'}\n`;
      shareMessage += `🏪 Merchant: ${merchant || 'Not specified'}\n`;
      shareMessage += `\n📊 Result: ${result.fraud_prediction ? '⚠️ FRAUD DETECTED' : '✅ Legit Transaction'}\n`;
      shareMessage += `📈 Risk Level: ${result.risk_level}\n`;
      shareMessage += `🎯 Fraud Probability: ${(result.fraud_probability * 100).toFixed(1)}%\n`;
      if (result.reason) {
        shareMessage += `\n📋 Reason: ${result.reason}\n`;
      }
      shareMessage += `\n🔒 Powered by FraudShield AI`;
      
      await Share.share({
        message: shareMessage,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.resultCard, { borderTopColor: getRiskColor(result.risk_level) }]}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>
            {result.fraud_prediction ? '⚠️' : '✅'}
          </Text>
        </View>

        <Text style={styles.prediction}>
          {result.fraud_prediction ? 'FRAUD DETECTED' : 'Legit Transaction'}
        </Text>

        <Text style={styles.amount}>Amount: £{amount}</Text>
        
        {cardType && (
          <Text style={styles.detailText}>Card: {cardType === 'credit' ? '💳 Credit' : '💷 Debit'}</Text>
        )}
        
        {merchant && (
          <Text style={styles.detailText}>Merchant: {merchant}</Text>
        )}

        <View style={styles.probabilityContainer}>
          <Text style={styles.probabilityLabel}>Fraud Probability</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${result.fraud_probability * 100}%`, backgroundColor: getRiskColor(result.risk_level) }
              ]}
            />
          </View>
          <Text style={styles.probabilityValue}>
            {(result.fraud_probability * 100).toFixed(1)}%
          </Text>
        </View>

        {/* REASON SECTION - NEW */}
        {result.reason && (
          <View style={styles.reasonContainer}>
            <Text style={styles.reasonLabel}>📋 Why this decision?</Text>
            <Text style={styles.reasonText}>{result.reason}</Text>
          </View>
        )}

        <View style={styles.riskContainer}>
          <Text style={styles.riskLabel}>Risk Level</Text>
          <Text style={[styles.riskValue, { color: getRiskColor(result.risk_level) }]}>
            {result.risk_level}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={shareResult}
          >
            <Text style={styles.shareButtonText}>📤 Share Analysis</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.newButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.newButtonText}>+ New Analysis</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    borderTopWidth: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: {
    fontSize: 60,
  },
  prediction: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  amount: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#888',
    marginBottom: 3,
  },
  probabilityContainer: {
    marginBottom: 20,
    marginTop: 15,
  },
  probabilityLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  probabilityValue: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  reasonContainer: {
    backgroundColor: '#f0f7ff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#1a73e8',
  },
  reasonLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a73e8',
    marginBottom: 6,
  },
  reasonText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  riskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginBottom: 20,
  },
  riskLabel: {
    fontSize: 16,
    color: '#666',
  },
  riskValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shareButton: {
    flex: 0.48,
    backgroundColor: '#e8f0fe',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#1a73e8',
    fontWeight: '600',
  },
  newButton: {
    flex: 0.48,
    backgroundColor: '#1a73e8',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  newButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});