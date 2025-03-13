# HandsOn - A Community-Driven Social Volunteering Platform

<div align="center">
    <h3>VolunteerConnects</h3>
    <p>A platform to connect volunteers with meaningful social impact opportunities.</p>
</div>

---

## 📖 About the Project

HandsOn is a social volunteering platform that enables individuals and organizations to create, discover, and participate in community-driven events. The platform fosters social responsibility by making volunteering structured, engaging, and rewarding.

🔹 **Discover & Join Volunteer Events**
🔹 **Post & Respond to Community Help Requests**
🔹 **Form Teams for Large-Scale Initiatives**
🔹 **Track Social Impact & Earn Recognition**

---

## 🛠 Tech Stack

### 🌐 Frontend
- Next.js (React-based Framework)
- Tailwind CSS
- TypeScript

### ⚙️ Backend
- Nest.js (Node.js Framework)
- PostgreSQL (Database)
- Prisma ORM
- JWT Authentication

### ☁️ Deployment
- Vercel (Frontend)
- AWS / DigitalOcean (Backend & Database)

---

## 🚀 Features

### 1️⃣ User Authentication & Profile Management
- Secure sign-up & login
- User profiles with volunteer history
- Skills & cause-based preferences

### 2️⃣ Volunteer Event Discovery & Registration
- Create & manage volunteer events
- Browse & filter events by category, location, and availability
- One-click registration for events

### 3️⃣ Community Help Requests
- Post & respond to community assistance requests
- Prioritize requests based on urgency levels

### 4️⃣ Team Formation & Collaboration
- Create public or private teams
- Team dashboards with member lists & impact stats

### 5️⃣ Impact Tracking & Social Recognition
- Log volunteer hours with verification
- Earn points & auto-generated certificates
- Public leaderboard showcasing top volunteers

---

## 📦 Installation & Setup

### Prerequisites
Ensure you have the following installed:
- Node.js (v18+)
- PostgreSQL

### Clone the Repository
```bash
$ git clone https://github.com/the-sudipta/hands-on-volunteering-platform.git
$ cd hands-on-volunteering-platform
```

### Backend Setup
```bash
$ cd backend
$ npm install
$ cp .env.example .env # Configure environment variables
$ npm run start:dev
```

### Frontend Setup
```bash
$ cd frontend
$ npm install
$ npm run dev
```

---

## 🛠 API Endpoints (Example)

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user

### Events
- `GET /api/events` - Fetch all events
- `POST /api/events` - Create a new event

### Volunteer Hours
- `POST /api/volunteer/log` - Log volunteer hours
- `GET /api/volunteer/leaderboard` - Get leaderboard data

---

## 🤝 Contributing
Contributions are welcome! Follow these steps:
1. Fork the repository
2. Create a feature branch (`feature/new-feature`)
3. Commit your changes (`git commit -m 'feat: add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📬 Contact
- **Author:** Sudipta Kumar Das
- **GitHub:** [@the-sudipta](https://github.com/the-sudipta)
- **LinkedIn:** [Sudipta Kumar](https://www.linkedin.com/in/sudiptakumar/)
