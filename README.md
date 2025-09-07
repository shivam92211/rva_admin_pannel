# KuCoin Broker Admin Panel

A comprehensive admin dashboard for monitoring and managing KuCoin broker accounts. Built with Vue.js 3, TypeScript, Tailwind CSS, and modern web technologies.

## Features

- **Dashboard**: Central hub for at-a-glance monitoring of broker activities
- **Sub-account Management**: Create, view, and manage sub-accounts and their API keys
- **Asset Management**: Handle fund transfers and view deposit/withdrawal history
- **Rebate Tracking**: Download and view broker rebate reports
- **API Integration**: Full integration with KuCoin Broker APIs
- **Responsive Design**: Modern, mobile-friendly interface

## Technology Stack

- **Framework**: Vue.js 3 with Composition API
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Pinia
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Icons**: Lucide Vue Next
- **Build Tool**: Vite

## Project Structure

```
src/
├── assets/          # Static assets
├── components/      # Reusable components
├── layouts/         # Layout components
├── router/          # Vue Router configuration
├── services/        # API service layer
├── stores/          # Pinia stores
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── views/           # Page components
└── main.ts          # Application entry point
```

## API Integration

The application integrates with the following KuCoin Broker API endpoints:

### Broker Information
- `GET /api/v1/broker/nd/info` - Get broker information

### Sub-account Management
- `POST /api/v1/broker/nd/account` - Create sub-account
- `GET /api/v1/broker/nd/account` - List sub-accounts
- `POST /api/v1/broker/nd/account/apikey` - Create API key
- `GET /api/v1/broker/nd/account/apikey` - Get API keys
- `POST /api/v1/broker/nd/account/update-apikey` - Modify API key
- `DELETE /api/v1/broker/nd/account/apikey` - Delete API key

### Asset Management
- `POST /api/v1/broker/nd/transfer` - Transfer funds
- `GET /api/v3/broker/nd/transfer/detail` - Transfer history
- `GET /api/v1/asset/ndbroker/deposit/list` - Deposit list
- `GET /api/v3/broker/nd/deposit/detail` - Deposit details
- `GET /api/v3/broker/nd/withdraw/detail` - Withdrawal details

### Rebate Tracking
- `GET /api/v1/broker/nd/rebase/download` - Download rebate report

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- KuCoin Broker API credentials

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd admin_panal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:5173`

### Configuration

1. **API Credentials**: Click the settings icon in the navigation bar to configure your KuCoin API credentials:
   - API Key
   - API Secret  
   - Passphrase

2. **Environment**: The application connects to KuCoin's production broker API endpoint (`https://api-broker.kucoin.com`)

### Build for Production

```bash
npm run build
```

The built application will be in the `dist` directory.

## Usage

### Dashboard
- View broker account summary
- Monitor sub-account count and broker level
- Quick access to main features

### Sub-account Management
- Create new sub-accounts with unique names
- View paginated list of all sub-accounts
- Manage API keys for each sub-account
- Set permissions (General, Spot, Futures) and IP whitelists

### Transfers
- Transfer funds between broker and sub-accounts
- Support for both directions (IN/OUT)
- Specify currency, amount, and target account

### Deposits
- View deposit history for all sub-accounts
- Filter by currency, status, and transaction hash
- Real-time status tracking

### Rebates
- Generate and download rebate reports
- Specify date range (max 6 months)
- Choose between Spot and Futures trading data
- CSV format with detailed commission breakdown

## Security Considerations

- API credentials are stored in localStorage
- All API requests use proper authentication headers
- IP whitelisting supported for API keys (max 20 IPs)
- Input validation for all forms
- Error handling and user feedback

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Code Style

The project uses:
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety
- Tailwind CSS for consistent styling

## API Authentication

The application uses KuCoin's standard API authentication:
- Requests include `KC-API-KEY` and `KC-API-PASSPHRASE` headers
- All private endpoints require proper authentication
- Error handling for authentication failures

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Support

For issues related to:
- **Application**: Create an issue in this repository
- **KuCoin API**: Refer to [KuCoin API Documentation](https://www.kucoin.com/docs-new)
- **Broker Features**: Contact KuCoin support

## License

This project is licensed under the MIT License.
