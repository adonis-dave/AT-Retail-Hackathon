# Smart Retail - Loyalty & Communication System Frontend

A modern, responsive frontend application for managing retail loyalty programs and customer communication.

## Features

- 🔐 **Authentication**: Login and Register pages
- 📊 **Dashboard**: View total customers and today's sales
- 👥 **Customers**: Manage and view customer information with points
- 💰 **Add Sale**: Record new sales and update customer points
- 📱 **Send SMS**: Send promotional messages to customer groups

## Tech Stack

- React 18
- React Router DOM
- Axios for API calls
- Vite for build tooling
- Modern CSS with gradients and animations

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Backend Configuration

The frontend communicates with a backend API. Set the backend URL in your environment:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Or modify `src/services/api.js` to change the base URL.

## Project Structure

```
src/
├── components/     # Reusable components (Layout, etc.)
├── pages/         # Page components (Login, Dashboard, etc.)
├── services/      # API service layer
├── App.jsx        # Main app component with routing
└── main.jsx       # Entry point
```

## Pages

1. **Login/Register**: User authentication
2. **Dashboard**: Overview statistics
3. **Customers**: Customer list with search
4. **Add Sale**: Record new sales
5. **Send SMS**: Send promotional messages

## API Endpoints Expected

The frontend expects the following backend endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/customers` - Get all customers
- `POST /api/sales` - Create a new sale
- `GET /api/sms/groups` - Get SMS groups
- `POST /api/sms/send` - Send SMS to group

