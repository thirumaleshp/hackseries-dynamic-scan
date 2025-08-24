# Algorand Event Management System

A comprehensive blockchain-powered event management system built on the Algorand blockchain. This application allows users to create events, register attendees, process payments in ALGOs, and generate unique NFTs as proof of attendance.

## 🚀 Features

### Core Functionality
- **Event Creation & Management**: Create and manage events with detailed information
- **User Registration**: Users can register for events (free or paid with ALGOs)
- **Blockchain Payments**: Secure ALGO payments for paid events
- **NFT Generation**: Automatic NFT creation for event attendees
- **QR Code Management**: Dynamic QR codes for event access and verification
- **Attendance Tracking**: Blockchain-based attendance confirmation
- **Smart Contract Integration**: Full Algorand TestNet integration

### Blockchain Features
- **Algorand TestNet Integration**: Complete integration with Algorand TestNet
- **Smart Contract Deployment**: Automated smart contract deployment for event management
- **NFT Asset Creation**: On-chain NFT generation and distribution
- **Payment Processing**: Secure ALGO transaction handling
- **Immutable Records**: Tamper-proof event and attendance records
- **Network Status Monitoring**: Real-time Algorand network status

### Security & Verification
- **Cryptographic Signatures**: All transactions are cryptographically signed
- **Blockchain Immutability**: Records cannot be altered once stored
- **Wallet Authentication**: Secure wallet-based authentication
- **NFT Verification**: Verifiable proof of attendance
- **Payment Validation**: Secure payment processing

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
- **Smart Contracts** (PyTeal) for data storage and logic
- **Algorand TestNet** for development and testing
- **NFT Standards** (ASA) for digital collectibles

### Smart Contracts
- **PyTeal** for contract development
- **Event Management** contract for event lifecycle
- **Registration System** for attendee management
- **NFT Minting** for attendance verification
- **Payment Processing** for ticket sales

## 🏗 Architecture

### Smart Contract Structure
```
Event Management Contract (PyTeal)
├── Global State
│   ├── event_count: Total events created
│   ├── total_registrations: Total registrations
│   ├── total_revenue: Total ALGO revenue
│   └── contract_version: Version of the contract
├── Event State (per event)
│   ├── event_name: Name of the event
│   ├── current_url: Current redirect URL
│   ├── access_type: Access control type
│   ├── expiry_date: Event expiry timestamp
│   ├── ticket_price: Price in microALGOs
│   ├── max_capacity: Maximum attendees
│   ├── registered_count: Current registrations
│   └── nft_asset_id: Associated NFT asset
└── User Registration State
    ├── registration_status: Status (pending/confirmed/attended)
    ├── registration_date: When registered
    ├── ticket_tier: Ticket type (general/vip/premium)
    ├── payment_amount: Amount paid
    └── nft_minted: NFT status
```

### Application Flow
1. **Event Creation**: Organizer creates event → Smart contract deployment → Event stored on blockchain
2. **User Registration**: User connects wallet → Selects ticket tier → Pays ALGOs → Registration recorded
3. **Event Attendance**: User attends event → Confirms attendance → NFT automatically generated
4. **NFT Collection**: User receives unique NFT → Proof of attendance → Collectible digital asset

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Algorand wallet (Pera Wallet recommended)
- Access to Algorand TestNet
- Python 3.8+ (for smart contract compilation)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd hackseries-dynamic-scan
```

2. **Install dependencies**
```bash
npm install
```

3. **Install Python dependencies for smart contracts**
```bash
pip install pyteal
```

4. **Start development server**
```bash
npm run dev
```

5. **Open in browser**
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

### Creating Events

1. **Connect Wallet**: Ensure your Algorand wallet is connected
2. **Navigate to Create Event**: Go to the "Create Event" page
3. **Fill Event Details**: 
   - Event name, description, and category
   - Date, time, and venue information
   - Ticket tiers and pricing
   - Event settings and visibility
4. **Deploy Contract**: Smart contract automatically deployed to Algorand
5. **Event Created**: Event is now live and accepting registrations

### Event Registration

1. **Browse Events**: View available events on the Events page
2. **Select Event**: Click "Register" on your chosen event
3. **Connect Wallet**: Connect your Algorand wallet
4. **Choose Ticket Tier**: Select from available ticket options
5. **Make Payment**: Pay ALGOs for paid events (free events require no payment)
6. **Registration Complete**: Your registration is recorded on the blockchain

### Attending Events & Getting NFTs

1. **Attend Event**: Show up at the event location
2. **Confirm Attendance**: Use the app to confirm your attendance
3. **NFT Generation**: System automatically creates and mints your NFT
4. **Receive NFT**: NFT is sent to your wallet as proof of attendance
5. **View Collection**: Check your NFT Gallery to see all your event NFTs

### Managing Your NFTs

1. **Navigate to NFT Gallery**: View your collection of event NFTs
2. **Filter & Search**: Find specific NFTs by event, tier, or date
3. **View Details**: See complete NFT information and metadata
4. **Share & Export**: Share your NFTs or download them

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

### NFT Configuration

```typescript
// src/services/nft-service.ts
const NFT_CONFIG = {
  decimals: 0, // NFTs are indivisible
  total: 1, // Only one NFT per event attendance
  defaultFrozen: false,
  manager: '', // Set to event creator
  reserve: '', // Set to event creator
  freeze: '', // Set to event creator
  clawback: '' // Set to event creator
};
```

## 🧪 Testing

### Manual Testing
1. Create an event with the application
2. Register for the event with a different wallet
3. Confirm attendance and verify NFT generation
4. Check NFT collection in the gallery
5. Test payment processing with TestNet ALGOs

### Blockchain Testing
- All transactions are on TestNet
- Use TestNet ALGOs (free from dispenser)
- Monitor transactions on [AlgoExplorer TestNet](https://testnet.algoexplorer.io/)
- Verify smart contract deployment and calls

### Smart Contract Testing
```bash
# Compile PyTeal contracts
cd src/contracts
python DynamicQRContract.py
```

## 🔒 Security Considerations

### Blockchain Security
- All event data is immutably stored on Algorand
- Smart contracts prevent unauthorized modifications
- Cryptographic signatures ensure authenticity
- NFT ownership is verifiable on-chain

### Application Security
- Wallet private keys never leave the user's device
- All blockchain interactions are signed locally
- No sensitive data stored in application state
- Secure payment processing with validation

### Best Practices
- Always verify NFT ownership before trusting
- Check event details on blockchain
- Monitor transaction confirmations
- Use secure wallet connections

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel/Netlify
The application is a static React app and can be deployed to any static hosting service.

### Smart Contract Deployment
Smart contracts are automatically deployed to TestNet. For MainNet deployment:
1. Update network configuration
2. Ensure sufficient ALGO balance
3. Deploy contracts manually
4. Update application configuration

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

**Event Registration Fails**
- Verify wallet is connected and has sufficient ALGO balance
- Check network connectivity to Algorand
- Ensure all required fields are filled

**NFT Generation Fails**
- Confirm attendance was properly recorded
- Check wallet connection and permissions
- Verify smart contract deployment

**Payment Issues**
- Ensure sufficient ALGO balance for ticket price + fees
- Check TestNet network status
- Verify transaction confirmations

### Getting Help
- Check the browser console for error messages
- Verify your wallet has TestNet ALGOs
- Ensure you're connected to the correct Algorand network
- Check smart contract deployment status

## 🔮 Future Enhancements

- **MainNet Support**: Production deployment on Algorand MainNet
- **Advanced NFT Features**: Metadata customization, rarity systems
- **Event Analytics**: Detailed attendance and revenue analytics
- **Multi-Currency Support**: Support for other cryptocurrencies
- **Mobile App**: Native mobile application
- **API Integration**: REST API for external integrations
- **Advanced Access Control**: Role-based permissions and gating
- **Event Marketplace**: Secondary ticket sales and trading

## 🌟 Key Benefits

### For Event Organizers
- **Blockchain Security**: Immutable event records
- **Automated Payments**: Secure ALGO processing
- **NFT Generation**: Automatic attendee verification
- **Real-time Analytics**: Live registration and attendance data
- **Cost Reduction**: Lower transaction fees than traditional systems

### For Attendees
- **Verifiable Credentials**: Blockchain-proof attendance
- **Unique Collectibles**: Exclusive event NFTs
- **Secure Payments**: Transparent ALGO transactions
- **Digital Portfolio**: Collectible event history
- **Transferable Assets**: Trade or gift your NFTs

### For the Ecosystem
- **Algorand Adoption**: Promotes blockchain usage
- **Innovation**: Cutting-edge event management
- **Community Building**: Enhanced attendee engagement
- **Transparency**: Public blockchain verification
- **Interoperability**: Standard NFT compatibility

---

Built with ❤️ on Algorand Blockchain

**Ready to revolutionize event management? Start building your blockchain-powered events today!**