# EduLink Backend

A secure Node.js backend application using Express and MongoDB.

## Features

- RESTful API for user management
- Secure MongoDB connection with comprehensive validation
- CORS configuration for frontend integration
- Environment-based configuration
- Comprehensive error handling and logging
- Security headers and best practices

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- npm or yarn package manager

## Security Features

### Database Security
- ✅ Environment variable configuration for sensitive data
- ✅ Connection string validation and sanitization
- ✅ Connection pooling with optimized settings
- ✅ Proper authentication and write concern settings
- ✅ Comprehensive error handling with helpful diagnostics
- ✅ Graceful shutdown handling

### Application Security
- ✅ CORS configuration with environment-specific origins
- ✅ Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- ✅ Request body size limiting (10MB)
- ✅ Input validation and sanitization in models
- ✅ MongoDB indexes for performance and security

### Data Validation
- ✅ Comprehensive user data validation
- ✅ Email uniqueness enforcement
- ✅ Input sanitization and length limits
- ✅ Type validation for all fields
- ✅ Custom validation messages

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the Backend directory:
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in `.env`:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/edulink?retryWrites=true&w=majority&appName=EduLink
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

## MongoDB Setup

### For MongoDB Atlas (Recommended for Production):

1. Create a MongoDB Atlas account at https://cloud.mongodb.com
2. Create a new cluster
3. Create a database user with read/write permissions
4. Add your IP address to the IP Access List (or use 0.0.0.0/0 for development)
5. Get your connection string and update the `MONGO_URI` in your `.env` file

### Connection String Format:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/edulink?retryWrites=true&w=majority&appName=EduLink
```

### Important Security Notes:
- Never commit your `.env` file to version control
- Use strong passwords for database users
- Restrict IP access in production environments
- Use URL encoding for special characters in passwords
- Always specify a database name in your connection string

### For Local Development:
```
MONGO_URI=mongodb://localhost:27017/edulink
```

## Running the Application

### Development Mode:
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

## API Endpoints

### Health Check
- `GET /` - Basic server status
- `GET /health` - Detailed health check including database connection status

### User Management
- `GET /users` - Get all users
- `POST /users` - Create a new user
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user by ID
- `DELETE /users/:id` - Delete user by ID

## Project Structure

```
Backend/
├── app.js              # Main application file
├── package.json        # Dependencies and scripts
├── .env.example        # Environment variables template
├── .gitignore         # Git ignore rules
├── Controllers/        # Route handlers
│   └── UserController.js
├── Model/             # Database models
│   └── UserModel.js
└── Routes/            # API routes
    └── UserRoutes.js
```

## Error Handling

The application includes comprehensive error handling for:
- Database connection issues
- Invalid MongoDB Atlas configurations
- Authentication failures
- Validation errors
- Network timeouts

## Monitoring

- Connection status monitoring with automatic reconnection
- Database ping verification
- Graceful shutdown handling
- Detailed error logging with troubleshooting tips

## Troubleshooting Atlas Auth Errors

If you see `bad auth : Authentication failed`:

- Confirm the database user and password in Atlas are correct; reset if unsure.
- Ensure the connection string includes a database name after `.net/` (e.g., `/edulink`).
- Check your IP Access List in Atlas (allow your IP or `0.0.0.0/0` temporarily for testing).
- URL-encode special characters in the password or use an environment variable.
- Make sure you are not using your Atlas account login—use a Database User instead.

## Connection String Tips

- For Atlas SRV URIs (`mongodb+srv://`), do NOT include a port number. SRV resolves hosts and ports via DNS.
- If you must specify ports, use the non-SRV scheme:
  - `mongodb://host1:27017,host2:27017/DB_NAME?replicaSet=...`
  - Include your database name after the host list.

## Contributing

1. Follow the existing code style
2. Add appropriate validation for new fields
3. Include error handling for new features
4. Update documentation for API changes

## Security Best Practices Implemented

1. **Environment Variables**: All sensitive configuration stored in environment variables
2. **Input Validation**: Comprehensive validation on all user inputs
3. **Database Security**: Secure connection strings and authentication
4. **CORS Configuration**: Properly configured cross-origin resource sharing
5. **Security Headers**: Added security headers to prevent common attacks
6. **Error Handling**: Detailed error messages without exposing sensitive information
7. **Connection Monitoring**: Real-time database connection monitoring
