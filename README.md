# Aaron Freeman Portfolio

A modern, responsive portfolio website for Aaron Freeman - Urban & Environmental Planner, built with Next.js 15, TypeScript, and Tailwind CSS.

![Aaron Freeman Portfolio](https://aaron-freeman-3h9qgg1bo-dominickudoms-projects.vercel.app/)

## 🌟 Features

### Core Functionality
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Theme**: Toggle between themes with smooth transitions
- **Interactive 3D Globe**: Three.js powered Earth visualization
- **Comments System**: Full-featured commenting with replies and admin controls
- **View Counter**: Track page views with Supabase integration
- **Contact Form**: Functional contact form with validation
- **Blog/Reflections**: Content management for thoughts and insights

### Technical Features
- **Next.js 15**: Latest React framework with App Router
- **TypeScript**: Full type safety throughout the application
- **Supabase Integration**: Real-time database for comments and views
- **Vercel Deployment**: Optimized for Vercel hosting
- **Framer Motion**: Smooth animations and transitions
- **Component Library**: Custom UI components with shadcn/ui
- **Admin Dashboard**: Secure admin controls for content management

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **3D Graphics**: Three.js
- **Animations**: Framer Motion
- **UI Components**: shadcn/ui + Radix UI
- **Deployment**: Vercel
- **Package Manager**: pnpm

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/aaron-freeman-portfolio.git
   cd aaron-freeman-portfolio
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ADMIN_DELETE_KEY=your_secure_admin_key
   ```

4. **Database Setup**
   Run the SQL scripts in the `supabase/` directory:
   - `schema.sql` - Main database schema
   - `comments_schema.sql` - Comments table setup
   - `add_views_migration.sql` - Views tracking

5. **Run Development Server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
aaron-freeman-portfolio/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── comments/      # Comments CRUD operations
│   │   ├── views/         # View tracking
│   │   └── upload/        # File upload handling
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── comments-section.tsx
│   ├── hero-section.tsx
│   ├── globe-3d.tsx
│   └── ...
├── lib/                  # Utilities and configurations
├── supabase/            # Database schemas and migrations
├── public/              # Static assets
└── styles/              # Additional stylesheets
```

## 🔧 API Endpoints

### Comments API (`/api/comments`)
- `GET` - Fetch comments for a blog post
- `POST` - Create new comment or reply
- `DELETE` - Admin delete comment (requires `ADMIN_DELETE_KEY`)

### Views API (`/api/views`)
- `GET` - Fetch view count for a page
- `POST` - Increment view count

### Upload API (`/api/upload`)
- `POST` - Handle file uploads to Vercel Blob Storage

## 🗄️ Database Schema

### Comments Table
```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blog_post_id UUID NOT NULL,
    author_name TEXT NOT NULL,
    author_email TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    is_approved BOOLEAN DEFAULT true
);
```

### Views Table
```sql
CREATE TABLE page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id TEXT NOT NULL,
    view_count INTEGER DEFAULT 0,
    last_viewed TIMESTAMPTZ DEFAULT NOW()
);
```

## 🎨 Key Components

### CommentsSection
- Nested comment threading
- Real-time comment posting
- Admin deletion capabilities
- Form validation and error handling

### Globe3D
- Interactive 3D Earth model
- Smooth rotation and controls
- Responsive design adaptation

### ThemeProvider
- System theme detection
- Persistent theme preferences
- Smooth theme transitions

## 🔒 Security Features

- **Input Validation**: Comprehensive form validation
- **SQL Injection Protection**: Parameterized queries
- **Admin Authentication**: Secure admin key system
- **Rate Limiting**: Built-in API protection
- **XSS Prevention**: Content sanitization

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key  
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
ADMIN_DELETE_KEY=your_secure_admin_key
```

## 🧪 Testing

```bash
# Run type checking
pnpm run type-check

# Run linting
pnpm run lint

# Build for production
pnpm run build

# Test comments API
node scripts/test-comments-api.js
```

## 📊 Performance Optimizations

- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic route-based splitting  
- **Tree Shaking**: Unused code elimination
- **Caching**: Static generation where possible
- **Bundle Analysis**: Webpack bundle optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Aaron Freeman**
- Portfolio: [https://www.freemanaaron.com](https://www.freemanaaron.com)
- Email: aaronfreeman1957@gmail.com
- Location: Brisbane, QLD, Australia

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Supabase](https://supabase.com/) - Backend as a Service
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [Three.js](https://threejs.org/) - 3D graphics library
- [Framer Motion](https://www.framer.com/motion/) - Animation library

---

**Live Demo**: [https://aaron-freeman-3h9qgg1bo-dominickudoms-projects.vercel.app](https://aaron-freeman-3h9qgg1bo-dominickudoms-projects.vercel.app)

**Status**: ✅ Production Ready | 🚀 Deployed | 💬 Comments Active | 🔒 Admin Enabled 