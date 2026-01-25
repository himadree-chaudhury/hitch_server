# 🤝 Hitch - Social Events & Activities Platform

![Hitch Banner](https://placehold.co/1200x300/2563eb/ffffff?text=Hitch+Platform+Preview&font=montserrat)

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**Bridging the gap between online discovery and offline participation.**

[View Demo](https://your-demo-link.com) · [Report Bug](https://github.com/yourusername/hitch/issues) · [Request Feature](https://github.com/yourusername/hitch/issues)

</div>

---

## 📖 Table of Contents

- [📍 Overview](#-overview)
- [✨ Key Features](#-key-features)
- [🛠️ Tech Stack](#-tech-stack)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [🔑 Environment Variables](#-environment-variables)
- [🔌 API Documentation](#-api-documentation)
- [📸 Screenshots](#-screenshots)
- [🤝 Contributing](#-contributing)

---

## 📍 Overview

**Hitch** is a platform designed to connect individuals who want to participate in local events, sports, or hobbies but lack companions. Whether it's a concert, a hiking trip, or a tech meetup, users can find like-minded people to join them.

The system supports three distinct roles: **Users** (Participants), **Hosts** (Event Organizers), and **Admins**.

---

## ✨ Key Features

<details>
<summary><b>👤 User (Participant) Features</b></summary>

* **Discover Events:** Filter by category, location, and date.
* **Join/Leave:** Seamlessly join events via Stripe payments or leave if plans change.
* **Profile:** Manage bio, interests, and view payment history.
* **Reviews:** Rate Hosts and Events after completion.
* **Dashboard:** Visualize spending habits and upcoming schedule.

</details>

<details>
<summary><b>🎤 Host (Organizer) Features</b></summary>

* **Create Events:** Detailed event creation with images, location, and capacity limits.
* **Management:** Update event status (Upcoming, Ongoing, Completed, Cancelled).
* **Analytics:** View revenue, audience growth, and ratings via interactive charts.
* **Verification:** Request to become a verified host.

</details>

<details>
<summary><b>🛡️ Admin Features</b></summary>

* **Platform Overview:** Monitor total users, hosts, and platform volume.
* **User Management:** Manage user roles and statuses.
* **Approvals:** Review and approve Host applications.

</details>

---

## 🛠️ Tech Stack

### **Frontend**
| Tech | Description |
| :--- | :--- |
| **Next.js 16** | App Router, Server Actions, SSR/CSR |
| **Tailwind CSS** | Utility-first styling |
| **Shadcn/UI** | Reusable accessible components |
| **Zod** | Schema validation |
| **Recharts** | Data visualization for dashboards |
| **Lucide React** | Beautiful iconography |

### **Backend**
| Tech | Description |
| :--- | :--- |
| **Node.js / Express** | RESTful API architecture |
| **Prisma ORM** | Type-safe database interactions |
| **PostgreSQL** | Relational database |
| **JWT** | Secure authentication (Access/Refresh tokens) |
| **Stripe** | Payment processing |
| **Nodemailer** | Email notifications |
| **Cloudinary** | Image hosting |

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* PostgreSQL (Local or Cloud like Supabase/Neon)
* Stripe Account
* Cloudinary Account

### Backend Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/himadree-chaudhury/hitch_server.git
    cd hitch_server
    ```

2.  **Install dependencies**
    ```bash
    pnpm install
    ```

3.  **Setup Database**
    ```bash
    npx prisma generate
    npx prisma migrate dev --name init
    ```

4.  **Run Server**
    ```bash
    pnpm run dev
    ```

### Frontend Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/himadree-chaudhury/hitch_client.git
    cd hitch_client
    ```

2.  **Install dependencies**
    ```bash
    pnpm install
    ```

3.  **Run Client**
    ```bash
    pnpm dev
    ```

---

## 🔑 Environment Variables

You must create a `.env` file in both `frontend` and `backend` directories.

<details open>
<summary><b>📂 Backend (.env)</b></summary>

```env
PORT=4000
NODE_ENV=development

DATABASE_URL='postgresql://postgres:yourpassword@localhost:5432/hitch_db?schema=public'

JWT_ACCESS_SECRET=your_access_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_ACCESS_EXPIRES_IN=access_token_expiry_time
JWT_REFRESH_EXPIRES_IN=refresh_token_expiry_time

SALT_ROUNDS=10

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

REDIS_USERNAME=default
REDIS_PASSWORD=your_redis_password
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

FRONTEND_URL=https://hitch-client.vercel.app
```

<details open>
<summary><b>📂 Frontend (.env)</b></summary>

```env
NEXT_PUBLIC_BASE_API_URL=http://localhost:4000/api/v1

JWT_ACCESS_SECRET=your_access_secret_key
```