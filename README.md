# GCR Pro - Google Classroom Assistant

A comprehensive Next.js application that integrates with Google Classroom to help students manage their coursework, assignments, and communication with professors more efficiently.

## 🚀 Features

### 📚 Google Classroom Integration
- **OAuth 2.0 Authentication**: Secure sign-in with Google accounts
- **Real-time Course Sync**: Automatically fetch and display all enrolled courses
- **Assignment Tracking**: View all assignments with due dates and submission status
- **Course Materials**: Access course announcements, topics, and materials
- **Student Rosters**: View classmates and course participants

### 📝 Assignment Management
- **Assignment Overview**: Dashboard displaying all upcoming and past assignments
- **Due Date Tracking**: Visual indicators for assignment deadlines
- **Recent Activity**: Timeline of recent submissions and updates
- **Assignment Details**: View full assignment descriptions and requirements
- **Submission Status**: Track submitted, missing, and upcoming assignments

### 🤖 AI-Powered Features
- **Assignment Solver**: AI-assisted problem solving using Google's Gemini 2.0 Flash
- **Document Processing**: Upload and analyze assignments in various formats (DOCX, PDF)
- **Smart Content Generation**: Generate structured responses and solutions

### ✉️ Email Communication
- **Professor Contact**: Integrated email composer to communicate with instructors
- **Professor Directory**: Organized list of all professors from enrolled courses
- **Template Generation**: AI-powered email composition assistance
- **Responsive Interface**: Split-panel design for efficient email management

### 🎨 User Experience
- **Dark/Light Mode**: Customizable theme preferences
- **Progressive Web App (PWA)**: Install as a desktop/mobile app
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Global Search**: Quick search across courses, assignments, and materials
- **Material Preview**: In-app preview of course materials and documents

### 🔒 Security & Privacy
- **NextAuth.js Integration**: Secure authentication flow
- **Token Management**: Automatic OAuth token refresh
- **MongoDB Storage**: Encrypted user data and settings
- **GridFS**: Secure file storage for assignments and documents

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.4** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Radix UI** - Accessible component primitives
- **Zustand** - State management

### Backend
- **Next.js API Routes** - Serverless functions
- **MongoDB & Mongoose** - Database and ODM
- **GridFS** - File storage
- **NextAuth.js** - Authentication
- **Nodemailer** - Email functionality

### AI & APIs
- **Google Gemini 2.0 Flash** - AI content generation
- **Google Classroom API** - Course and assignment data
- **Google OAuth 2.0** - Authentication and authorization

### Additional Tools
- **Mammoth** - DOCX parsing
- **Fuse.js** - Fuzzy search
- **date-fns** - Date formatting
- **Vercel KV** - Caching layer

## 📦 Installation

1. **Clone the repository**
```bash
git clone https://github.com/mudasarmajeed5/gcr-pro.git
cd gcr-pro
```

2. **Install dependencies**
```bash
pnpm install
# or
npm install
# or
yarn install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# NextAuth
AUTH_SECRET=your_nextauth_secret
AUTH_TRUST_HOST=true

# Google OAuth
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Email (optional)
EMAIL_USER=your_email
EMAIL_PASS=your_email_password

# Vercel KV (optional)
KV_URL=your_kv_url
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token
KV_REST_API_READ_ONLY_TOKEN=your_kv_read_only_token
```

4. **Run the development server**
```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔑 Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Google Classroom API
   - Google OAuth 2.0
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Add required OAuth scopes:
   - `classroom.courses.readonly`
   - `classroom.rosters.readonly`
   - `classroom.student-submissions.me.readonly`
   - `classroom.courseworkmaterials.readonly`
   - `classroom.announcements.readonly`
   - `classroom.topics.readonly`

## 📱 PWA Installation

The app can be installed as a Progressive Web App:
- **Desktop**: Look for the install icon in the browser address bar
- **Mobile**: Use "Add to Home Screen" option in browser menu

## 🏗️ Project Structure

```
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (main)/            # Main application pages
│   │   ├── assignments/   # Assignment views
│   │   ├── courses/       # Course pages
│   │   ├── solver/        # AI solver interface
│   │   ├── send-email/    # Email composer
│   │   └── settings/      # User settings
│   └── api/               # API routes
├── components/            # Reusable UI components
├── lib/                   # Utilities and helpers
│   ├── gemini.ts         # AI integration
│   ├── classroom/        # Google Classroom helpers
│   └── gridfs.ts         # File storage
├── models/               # MongoDB schemas
├── store/                # Zustand state management
├── hooks/                # Custom React hooks
└── types/                # TypeScript definitions
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms
Build the production bundle:
```bash
pnpm build
pnpm start
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🐛 Known Issues & Future Enhancements

- Assignment solver feature in development
- Enhanced file format support planned
- Batch email functionality coming soon
- Calendar integration planned

## 💬 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js and Google Classroom API
