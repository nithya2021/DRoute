# DRoute - Singapore Delivery Route Optimization

DRoute is a comprehensive delivery route optimization platform designed specifically for Singapore. It enables businesses to import delivery addresses, automatically optimize routes across 5 drivers, and track deliveries with proof capture.

## Features

- **Excel Import**: Upload delivery addresses with postal codes
- **Route Optimization**: Automatically cluster and optimize ~20 stops per driver
- **5-Driver Allocation**: Geographically intelligent distribution across drivers
- **Google Maps Integration**: Navigate routes directly from the app
- **Delivery Tracking**: Mark routes as in-progress or completed
- **Driver Management**: View driver assignments and route status
- **Proof of Delivery**: Capture images and signatures for each stop

## Project Structure

```
droute/
├── packages/
│   ├── server/          # Express backend API
│   ├── client/          # React frontend
│   └── shared/          # Shared TypeScript types
├── package.json
└── README.md
```

## Prerequisites

- Node.js (v18+)
- npm or yarn
- Git

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd DRoute
```

2. Install dependencies:
```bash
npm install
```

## Development

### Run Both Server and Client

```bash
npm run dev
```

This will start:
- **Server**: http://localhost:3001
- **Client**: http://localhost:5173

### Run Server Only

```bash
npm run dev --workspace=@droute/server
```

### Run Client Only

```bash
npm run dev --workspace=@droute/client
```

## Building for Production

```bash
npm run build
```

## API Endpoints

### Import
- `POST /api/import/excel` - Upload Excel file with delivery data
- `GET /api/import/jobs` - List import jobs
- `GET /api/import/jobs/:id` - Get specific import job status

### Optimization
- `POST /api/optimization/optimize` - Run route optimization
- `GET /api/optimization/routes` - Get all optimized routes
- `GET /api/optimization/routes/:id` - Get specific route

### Drivers
- `GET /api/drivers` - List all drivers
- `GET /api/drivers/:id` - Get driver details
- `GET /api/drivers/:id/routes` - Get routes for a driver

### Routes
- `GET /api/routes` - List all routes
- `GET /api/routes/:id` - Get route details
- `PATCH /api/routes/:id` - Update route status
- `POST /api/routes/:routeId/proof` - Add delivery proof (image/signature)
- `GET /api/routes/:routeId/proofs` - Get delivery proofs for route

## Excel Format

Your Excel file should have the following columns:

| Column | Required | Description |
|--------|----------|-------------|
| address | Yes | Full delivery address |
| postalCode | Yes | Singapore 6-digit postal code |
| customerName | No | Customer name |
| contactNumber | No | Phone number |
| notes | No | Special delivery instructions |

## Usage Flow

1. **Import**: Upload Excel file with delivery stops
2. **Optimize**: Click "Optimize Routes" to cluster and assign to drivers
3. **Review**: Check routes, view on Google Maps
4. **Assign**: Routes are automatically assigned to 5 drivers
5. **Execute**: Drivers update route status as they complete deliveries
6. **Proof**: Drivers capture photos for proof of delivery

## Route Optimization Algorithm

DRoute uses K-means clustering combined with nearest-neighbor TSP optimization:

1. **Clustering**: Divides all delivery stops into 5 geographic clusters
2. **Ordering**: Within each cluster, orders stops using nearest-neighbor algorithm
3. **Distance**: Calculates Haversine distance between coordinates
4. **Estimation**: Estimates delivery time based on distance and stop count

### Target Allocation
- **Total Drivers**: 5
- **Target per Driver**: ~20 stops
- **Average Distance**: 20 km/h in Singapore traffic
- **Time per Stop**: ~5 minutes

## Technology Stack

### Backend
- Express.js (API server)
- TypeScript (type safety)
- xlsx (Excel parsing)
- Node.js

### Frontend
- React (UI framework)
- TypeScript (type safety)
- Vite (build tool)
- Axios (HTTP client)
- CSS3 (styling)

### Shared
- TypeScript (types)

## Data Storage

Currently uses in-memory storage (suitable for demo/POC). For production:
- Upgrade to PostgreSQL
- Add database migrations
- Implement data persistence

## Geocoding

Currently uses postal code-based approximate coordinates. For production:
- Integrate Google Maps Geocoding API
- Cache geocoding results
- Handle Singapore-specific address formats

## Testing

Run tests:
```bash
npm run test
```

Run coverage:
```bash
npm run test:coverage
```

## Deployment

### Deploy to Production

1. Build the application:
```bash
npm run build
```

2. Deploy server to your host (Node.js compatible)
3. Deploy client to CDN or static host

### Environment Variables

Create `.env` in server:
```
PORT=3001
NODE_ENV=production
```

## Features Roadmap

- [ ] Database integration (PostgreSQL)
- [ ] Real Google Maps API integration
- [ ] Real-time driver tracking (WebSocket)
- [ ] Mobile app for drivers
- [ ] Photo proof upload to cloud storage
- [ ] SMS/Email notifications
- [ ] Analytics dashboard
- [ ] Multi-user support with authentication
- [ ] Integration with delivery tracking services

## Contributing

1. Create a feature branch
2. Make your changes
3. Commit and push
4. Create a pull request

## License

Proprietary - Singapore Delivery Route Optimization

## Support

For issues or questions, contact the development team.

---

**DRoute** - Optimizing Singapore's last-mile delivery since 2024
