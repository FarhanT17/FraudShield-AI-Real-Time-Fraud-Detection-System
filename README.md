# 🛡️ FraudShield AI - Real-Time Fraud Detection System

An end-to-end fraud detection system with React Native mobile app and FastAPI backend.

## 📱 Features

- **Real-time fraud detection** - Instant transaction analysis
- **Smart detection rules** - Considers amount, time, card type, merchant
- **Location services** - Optional GPS tracking for risk assessment
- **Transaction history** - Store and review past scans
- **Analytics dashboard** - View fraud statistics and model performance
- **Share results** - Export analysis to messages

## 📊 Model Performance

| Metric | Score |
|--------|-------|
| ROC-AUC | 92.38% |
| Fraud Recall | 80% |
| Features | 435 |
| Training Data | 590,540 transactions |

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Mobile App | React Native (Expo) |
| Navigation | React Navigation (Stack + Bottom Tabs) |
| Storage | AsyncStorage |
| Location | Expo Location API |
| Backend | FastAPI + XGBoost |

## 📱 Screens

### Detect Screen
- Enter transaction amount
- Select card type (Credit/Debit)
- Add merchant (optional)
- Enable/disable location
- One-tap analysis

### Result Screen
- Fraud/Legit verdict
- Probability progress bar
- Risk level (HIGH/MEDIUM/LOW)
- Explanation of decision
- Share results

### History Screen
- List of all past transactions
- Color-coded risk indicators
- Clear history option

### Analytics Dashboard
- Total scans counter
- Fraud/Legit counts
- Fraud rate percentage
- Average risk score
- Model information

## 🚀 Installation

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- Expo Go app (iOS/Android)

### Steps

```bash
# Clone the repository
git clone https://github.com/FarhanT17/FraudShield-AI-Real-Time-Fraud-Detection-System.git
cd FraudShield-AI

# Install dependencies
npm install

# Start the app
npx expo start

Scan the QR code with Expo Go on your phone.

🎯 Detection Logic
The app uses smart rules for realistic fraud detection:

Scenario	Result	Risk Level
£1500 at 3 AM	Fraud	HIGH
£25 grocery at 2 PM	Legit	LOW
£600 electronics at 2 PM	Fraud	MEDIUM
£5 at 3 AM	Fraud	HIGH
📁 Project Structure
text
FraudShield-AI/
├── App.js                 # Main navigation
├── screens/
│   ├── HomeScreen.js      # Detection screen
│   ├── ResultScreen.js    # Results display
│   ├── HistoryScreen.js   # Transaction history
│   └── DashboardScreen.js # Analytics dashboard
├── package.json
└── README.md
🔧 Backend 
The app can also connect to a real XGBoost model backend. To enable:

Set useSmartRules = false in HomeScreen.js

Run the FastAPI backend

Update API_URL with your IP

## 📱 App Screenshots

<div align="center">
  <table>
    <tr>
      <td align="center"><b>🏠 Home Screen</b></td>
      <td align="center"><b>📊 Result Screen</b></td>
    </tr>
    <tr>
      <td><img src="assets/Home%20Screen.jpeg" width="300"></td>
      <td><img src="assets/Result%20Screen.jpeg" width="300"></td>
    </tr>
    <tr>
      <td align="center"><b>📜 History Screen</b></td>
      <td align="center"><b>📈 Analytics Dashboard</b></td>
    </tr>
    <tr>
      <td><img src="assets/History%20Screens.jpeg" width="300"></td>
      <td><img src="assets/Analytics%20Dashboard.jpeg" width="300"></td>
    </tr>
  </table>
</div>

*FraudShield AI in action - Real-time fraud detection on mobile*

📄 License
MIT

👨‍💻 Author
Farhan Tariq

MSc Cyber Security (Distinction) - Northumbria University

https://www.linkedin.com/in/farhant17/

https://github.com/FarhanT17/

https://farhantariq.vercel.app/
