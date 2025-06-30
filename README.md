# AlgoQR - Blockchain QR Verification System

A decentralized QR code verification system built on the Algorand blockchain. This application allows users to create tamper-proof QR codes that are cryptographically secured and immutably stored on the blockchain.

## 🚀 Features

### Core Functionality
- **Blockchain QR Generation**: Create QR codes that are stored on Algorand blockchain
- **Cryptographic Verification**: Verify QR codes against blockchain records
- **Wallet Integration**: Connect with Algorand wallets (Pera Wallet, MyAlgo, etc.)
- **Smart Contract Storage**: QR metadata stored in Algorand Smart Contracts (ASC1)
- **Real-time Scanning**: Camera and image upload QR code scanning
- **Expiry Management**: Set expiration dates for QR codes
- **Transaction History**: View all blockchain transactions and verifications

### Blockchain Features
- **Algorand TestNet Integration**: Full integration with Algorand TestNet
- **Smart Contract Deployment**: Automated smart contract deployment for QR storage
- **Transaction Verification**: Real blockchain transaction verification
- **Immutable Records**: Tamper-proof QR code storage
- **Network Status Monitoring**: Real-time Algorand network status

### Security
- **Cryptographic Signatures**: All QR codes are cryptographically signed
- **Blockchain Immutability**: Records cannot be altered once stored
- **Wallet Authentication**: Secure wallet-based authentication
- **Expiry Validation**: Automatic expiry checking on verification

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons
- **Sonner** for notifications

### Blockchain
- **Algorand SDK** (algosdk) for blockchain interaction
- **Pera Wallet Connect** for wallet integration
- **Smart Contracts** (ASC1) for data storage
- **Algorand TestNet** for development and testing

### QR Code Libraries
- **react-qr-code** for QR generation
- **html5-qrcode** for camera scanning
- **jsQR** for image processing

## 🏗 Architecture

### Smart Contract Structure
```
QR Verification Contract (ASC1)
├── Global State
│   ├── qr_count: Total QR codes created
│   └── creator: Contract creator address
└── Local State (per QR code)
    ├── label: QR code label
    ├── description: QR code description
    ├── created_at: Creation timestamp
    ├── expiry_date: Expiry timestamp
    └── is_active: Active status
```

### Application Flow
1. **Wallet Connection**: User connects Algorand wallet
2. **QR Generation**: Create QR with metadata → Store in smart contract → Generate verification URL
3. **QR Scanning**: Scan QR code → Extract ID → Query blockchain → Verify authenticity
4. **Verification**: Display results with blockchain transaction details

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Algorand wallet (Pera Wallet recommended)
- Access to Algorand TestNet

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd algorand-qr-verification
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open in browser**
Navigate to `http://localhost:5173`

### Wallet Setup

1. **Install Pera Wallet**
   - Download from [Pera Wallet](https://perawallet.app/)
   - Create or import an Algorand account
   - Ensure you're on TestNet

2. **Get TestNet ALGOs**
   - Visit [Algorand TestNet Dispenser](https://testnet.algoexplorer.io/dispenser)
   - Fund your wallet with test ALGOs

3. **Connect to Application**
   - Click "Connect Wallet" in the application
   - Approve the connection in your wallet

## 📱 Usage

### Creating QR Codes

1. **Connect Wallet**: Ensure your Algorand wallet is connected
2. **Navigate to Generate**: Go to the "Generate QR" page
3. **Fill Details**: 
   - Enter a label (required)
   - Add description (optional)
   - Set expiry date (optional)
   - Choose notification preferences
4. **Generate**: Click "Generate QR Code"
5. **Blockchain Storage**: The QR metadata is stored on Algorand blockchain
6. **Download**: Save the QR code image for use

### Scanning QR Codes

1. **Navigate to Scan**: Go to the "Scan QR" page
2. **Choose Method**:
   - **Camera**: Click "Start Camera" to use device camera
   - **Upload**: Click "Upload Image" to scan from file
   - **Drag & Drop**: Drag image file onto the scan area
3. **Verification**: The system automatically verifies against blockchain
4. **Results**: View verification status and blockchain details

### Viewing History

1. **Navigate to History**: Go to the "History" page
2. **Filter Options**: Filter by type, status, or date range
3. **Transaction Details**: View blockchain transaction IDs and timestamps
4. **Export**: Download transaction history (coming soon)

## 🔧 Configuration

### Algorand Network Configuration

The application is configured for Algorand TestNet by default. To modify:

```typescript
// src/services/algorand.ts
const ALGORAND_CONFIG = {
  server: 'https://testnet-api.algonode.cloud',
  port: '',
  token: '',
  network: 'testnet' // or 'mainnet'
};
```

### Smart Contract Deployment

Smart contracts are automatically deployed when first needed. The App ID is stored locally for subsequent use.

## 🧪 Testing

### Manual Testing
1. Generate a QR code with the application
2. Scan the generated QR code
3. Verify the blockchain transaction details match
4. Test expiry functionality with past dates
5. Test with invalid QR codes

### Blockchain Testing
- All transactions are on TestNet
- Use TestNet ALGOs (free from dispenser)
- Monitor transactions on [AlgoExplorer TestNet](https://testnet.algoexplorer.io/)

## 🔒 Security Considerations

### Blockchain Security
- All QR metadata is immutably stored on Algorand
- Smart contracts prevent unauthorized modifications
- Cryptographic signatures ensure authenticity

### Application Security
- Wallet private keys never leave the user's device
- All blockchain interactions are signed locally
- No sensitive data stored in application state

### Best Practices
- Always verify QR codes before trusting content
- Check expiry dates on time-sensitive QR codes
- Monitor blockchain transactions for your account

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify/Vercel
The application is a static React app and can be deployed to any static hosting service.

### Environment Variables
No environment variables required - all configuration is in the code.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

**Wallet Connection Issues**
- Ensure you're using a supported wallet (Pera Wallet recommended)
- Check that you're on the correct network (TestNet)
- Try refreshing the page and reconnecting

**QR Generation Fails**
- Verify wallet is connected and has sufficient ALGO balance
- Check network connectivity to Algorand
- Ensure all required fields are filled

**Verification Fails**
- Confirm the QR code was generated by this application
- Check if the QR code has expired
- Verify network connection to Algorand

### Getting Help
- Check the browser console for error messages
- Verify your wallet has TestNet ALGOs
- Ensure you're connected to the correct Algorand network

## 🔮 Future Enhancements

- **MainNet Support**: Production deployment on Algorand MainNet
- **Batch Operations**: Generate/verify multiple QR codes at once
- **API Integration**: REST API for external integrations
- **Mobile App**: Native mobile application
- **Advanced Analytics**: Detailed scanning analytics and reporting
- **Multi-signature**: Support for multi-signature QR codes
- **NFT Integration**: Link QR codes to Algorand NFTs

---

Built with ❤️ on Algorand Blockchain