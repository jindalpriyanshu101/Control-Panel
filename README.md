# CyberPanel Hosting Platform

A modern web hosting management platform built with Next.js, integrating with CyberPanel APIs to provide users with seamless website hosting services.

## Features

### 🚀 Core Features
- **User Authentication & Authorization** - Secure login/registration with role-based access control
- **Modern Landing Page** - Attractive, responsive design with great color schemes
- **Admin Dashboard** - Complete control panel for administrators
- **User Dashboard** - User-friendly interface for managing hosting services

### 🔐 Authentication System
- **Secure Registration/Login** - Email-based authentication with password hashing
- **Role-Based Access Control** - Admin and User roles with different permissions
- **Session Management** - Secure session handling with NextAuth.js

### 🎛️ Admin Dashboard
- **User Management** - View, create, and manage user accounts
- **Website Provisioning** - Grant websites to users through CyberPanel API
- **System Monitoring** - Activity logs and system status
- **CyberPanel Integration** - Full access to all CyberPanel features

### 👤 User Dashboard
- **Website Management** - View and manage assigned websites
- **Domain Configuration** - DNS and SSL management
- **Resource Monitoring** - Bandwidth and storage usage
- **Support Tickets** - Request help and track issues

### 🔌 CyberPanel API Integration
- **Website Creation** - Automated website provisioning
- **SSL Management** - Certificate installation and renewal
- **Database Management** - MySQL/PostgreSQL database creation
- **Email Accounts** - Email service configuration
- **Backup Services** - Automated backup scheduling

## Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Headless UI
- **Authentication**: NextAuth.js
- **Database**: Prisma ORM with SQLite (development)
- **API Integration**: Axios for CyberPanel API calls
- **Icons**: Lucide React
- **Security**: bcryptjs for password hashing, JWT tokens

## Project Structure

```
cyberpanel-hosting-platform/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication routes
│   │   ├── admin/             # Admin dashboard
│   │   ├── dashboard/         # User dashboard
│   │   ├── api/               # API routes
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable components
│   │   ├── ui/               # UI components
│   │   ├── admin/            # Admin components
│   │   └── dashboard/        # Dashboard components
│   ├── lib/                  # Utilities and configurations
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── db.ts             # Database connection
│   │   └── cyberpanel.ts     # CyberPanel API client
│   └── types/                # TypeScript type definitions
├── prisma/
│   └── schema.prisma         # Database schema
├── public/                   # Static assets
└── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- CyberPanel server with API access

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cyberpanel-hosting-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update the following variables:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"
   
   # NextAuth
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   
   # CyberPanel API
   CYBERPANEL_URL="https://your-cyberpanel-server:8090"
   CYBERPANEL_API_KEY="your-api-key"
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   npm run db:generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/session` - Get current session

### User Management (Admin)
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user

### Website Management
- `GET /api/websites` - List user's websites
- `POST /api/websites` - Create new website (Admin)
- `PUT /api/websites/[id]` - Update website
- `DELETE /api/websites/[id]` - Delete website

### CyberPanel Integration
- `POST /api/cyberpanel/create-website` - Create website via CyberPanel
- `POST /api/cyberpanel/install-ssl` - Install SSL certificate
- `GET /api/cyberpanel/website-status` - Check website status

## Deployment

### Production Setup
1. Set up a production database (PostgreSQL recommended)
2. Configure environment variables for production
3. Build the application: `npm run build`
4. Start the production server: `npm start`

### Docker Deployment
```bash
docker build -t cyberpanel-platform .
docker run -p 3000:3000 cyberpanel-platform
```

## Security Features

- **Password Hashing** - bcryptjs with salt rounds
- **CSRF Protection** - Built-in NextAuth.js protection
- **SQL Injection Prevention** - Prisma ORM parameterized queries
- **XSS Protection** - React's built-in XSS prevention
- **Session Security** - Secure HTTP-only cookies

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email admin@yourplatform.com or create an issue in the repository.

## Acknowledgments

- CyberPanel team for the excellent hosting control panel
- Next.js team for the amazing framework
- Vercel for hosting and deployment solutions
