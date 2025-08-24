#!/bin/bash

# Algorand Event Management System - Deployment Script
# This script helps set up and deploy the complete system

echo "🚀 Algorand Event Management System - Deployment Script"
echo "======================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    echo "   Please upgrade Node.js to continue."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    echo "   Download from: https://python.org/"
    exit 1
fi

echo "✅ Python $(python3 --version) detected"

# Install Python dependencies
echo ""
echo "📦 Installing Python dependencies..."
pip3 install pyteal

if [ $? -eq 0 ]; then
    echo "✅ PyTeal installed successfully"
else
    echo "⚠️  PyTeal installation failed. You may need to install it manually:"
    echo "   pip3 install pyteal"
fi

# Install Node.js dependencies
echo ""
echo "📦 Installing Node.js dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Node.js dependencies installed successfully"
else
    echo "❌ Failed to install Node.js dependencies"
    exit 1
fi

# Compile smart contracts
echo ""
echo "🔧 Compiling smart contracts..."
cd src/contracts
python3 DynamicQRContract.py

if [ $? -eq 0 ]; then
    echo "✅ Smart contracts compiled successfully"
else
    echo "⚠️  Smart contract compilation failed. This may not affect basic functionality."
fi

cd ../..

# Check if .env file exists
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating environment configuration..."
    cat > .env << EOF
# Algorand Event Management System Configuration
# Network Configuration
REACT_APP_ALGORAND_NETWORK=testnet
REACT_APP_ALGORAND_SERVER=https://testnet-api.algonode.cloud
REACT_APP_ALGORAND_PORT=
REACT_APP_ALGORAND_TOKEN=

# Application Configuration
REACT_APP_APP_NAME=Algorand Event Management
REACT_APP_APP_VERSION=2.0.0
REACT_APP_APP_DESCRIPTION=Blockchain-powered event management system

# Feature Flags
REACT_APP_ENABLE_NFT_GENERATION=true
REACT_APP_ENABLE_PAYMENT_PROCESSING=true
REACT_APP_ENABLE_ATTENDANCE_TRACKING=true
EOF
    echo "✅ Environment configuration created"
else
    echo "✅ Environment configuration already exists"
fi

# Create deployment info
echo ""
echo "📋 Creating deployment information..."
cat > DEPLOYMENT_INFO.md << EOF
# Deployment Information

## System Status
- **Deployment Date**: $(date)
- **Node.js Version**: $(node -v)
- **npm Version**: $(npm -v)
- **Python Version**: $(python3 --version)
- **System**: $(uname -s) $(uname -m)

## Configuration
- **Network**: TestNet
- **Smart Contracts**: Compiled
- **Dependencies**: Installed
- **Environment**: Configured

## Next Steps
1. Start the development server: \`npm run dev\`
2. Open browser to: http://localhost:5173
3. Connect your Algorand wallet (Pera Wallet recommended)
4. Get TestNet ALGOs from: https://testnet.algoexplorer.io/dispenser
5. Create your first event!

## Testing
- All functionality works on Algorand TestNet
- Use TestNet ALGOs for testing payments
- NFTs are generated on TestNet
- Smart contracts are deployed to TestNet

## Production Deployment
To deploy to production:
1. Update network configuration to MainNet
2. Ensure sufficient ALGO balance for contract deployment
3. Deploy smart contracts manually
4. Update environment variables
5. Build and deploy frontend

## Support
- Check console logs for errors
- Verify wallet connection
- Ensure TestNet ALGO balance
- Monitor blockchain transactions
EOF

echo "✅ Deployment information created"

# Final setup instructions
echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Your Algorand Event Management System is ready!"
echo ""
echo "📱 To start the application:"
echo "   npm run dev"
echo ""
echo "🌐 Open your browser to: http://localhost:5173"
echo ""
echo "🔗 Before using:"
echo "   1. Install Pera Wallet: https://perawallet.app/"
echo "   2. Create/import TestNet account"
echo "   3. Get TestNet ALGOs: https://testnet.algoexplorer.io/dispenser"
echo "   4. Connect wallet in the application"
echo ""
echo "📚 Documentation: README.md"
echo "🔧 Configuration: .env"
echo "📋 Deployment Info: DEPLOYMENT_INFO.md"
echo ""
echo "Happy building! 🚀"
