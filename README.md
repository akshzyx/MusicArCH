# JojiArCH 🎵

_A fan-curated archive chronicling Joji's musical evolution through distinct creative eras._

🌐 **Live Site**: [JojiArCH](https://jojiarch.vercel.app)

![JojiArCH Banner](https://github.com/user-attachments/assets/853b6f71-8614-4a95-9887-d6f61379fa34)

---

## 📝 About

**JojiArCH** is a passion project that documents Joji’s journey from lo-fi SoundCloud drops to chart-topping releases. With carefully categorized eras, unreleased gems, and exclusive insights, it serves as an immersive destination for fans and collectors alike.

### 🎯 Mission

To preserve Joji’s artistic legacy and deliver a well-structured, fan-first musical archive.

---

## ✨ Features

- **Era-Based Navigation** – Explore Joji’s discography by distinct creative periods
- **Full Tracklists** – Covers released songs, leaks, stems, and sessions
- **Built-in Audio Player** – Stream music directly from the website
- **Community Collaboration** – Edits and suggestions coming soon!

---

## 🎤 Joji: A Musical Evolution

George Kusunoki Miller, aka **Joji**, emerged from the ashes of _Filthy Frank_ and became a critically acclaimed artist in 2017 with _In Tongues_. Major milestones include:

- 🎶 **Ballads 1 (2018)** — First Asian artist to top Billboard’s R&B/Hip-Hop chart (_Slow Dancing in the Dark_)
- 🍯 **Nectar (2020)** — Lush, genre-fluid, and emotionally layered (_Run_, _Gimme Love_)
- 🔄 **Smithereens (2022)** — Raw and minimalistic, led by breakout hit (_Glimpse of Us_)

---

## ⚙️ Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS
- **Auth**: Clerk
- **Database**: Supabase
- **Hosting**: Vercel

---

## 🚀 Getting Started

Follow these steps to set up and deploy JojiArCH locally or to a hosting platform like Vercel:

### 🧬 Clone the Repository

```bash
git clone https://github.com/akshzyx/MusicArCH.git
cd MusicArCH
```

### 📦 Install Dependencies

Ensure [Node.js](https://nodejs.org/) is installed, then:

```bash
npm install
```

---

### 🔧 Environment Variables

Create a `.env.local` file in the root directory and configure:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key

# Clerk Redirects
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Webhooks
CLERK_WEBHOOK_SECRET=your-webhook-secret

# GitHub API
NEXT_PUBLIC_GITHUB_TOKEN=ghp_your_token_here
```

🔑 Get your credentials from:

- [Supabase Dashboard](https://app.supabase.com/)
- [Clerk Dashboard](https://clerk.dev/)
- [GitHub Tokens](https://github.com/settings/tokens)

---

### 🗂️ Supabase Schema

#### 📁 `eras` Table

| Field         | Type    | Description          |
| ------------- | ------- | -------------------- |
| `id`          | string  | Unique era ID        |
| `title`       | string  | Era name             |
| `description` | string? | Optional description |
| `cover_image` | string  | Cover image URL      |
| `start_date`  | string? | Optional start date  |
| `end_date`    | string? | Optional end date    |
| `album_rank`  | number  | Sort order           |

#### 🎵 `releases` Table

| Field         | Type        | Description                                                                   |
| ------------- | ----------- | ----------------------------------------------------------------------------- |
| `id`          | number      | Track ID                                                                      |
| `era_id`      | string      | References `eras` table                                                       |
| `title`       | string      | Track title                                                                   |
| `duration`    | string      | Format: `mm:ss`                                                               |
| `file`        | string      | Audio file URL/path                                                           |
| `cover_image` | string      | Cover image URL                                                               |
| `og_filename` | string?     | Original filename                                                             |
| `file_date`   | string?     | Date the file originated                                                      |
| `leak_date`   | string?     | Leak date                                                                     |
| `aka`         | string?     | Alternate name/title                                                          |
| `category`    | string?     | Available options like `released` \| `unreleased` \| `stems`                  |
| `type`        | string?     | Demo, session, snippet, etc.                                                  |
| `track_type`  | string?     | Optional sub-classification                                                   |
| `credit`      | string?     | Composer/producer/label                                                       |
| `multi_files` | JsonFolder? | For multi-track/stem folders                                                  |
| `available`   | string?     | Available options like `Confirmed` \| `Partial` \| `Snippet` \| etc...        |
| `quality`     | string?     | Available options like `High Quality` \| `Lossless` \| `CD Quality` \| etc... |
| `notes`       | string?     | Additional notes                                                              |

#### 💬 `testimonials` Table

| Field         | Type        | Description                                      |
| ------------- | ----------- | ------------------------------------------------ |
| `id`          | UUID        | Unique identifier (generated automatically)      |
| `quote`       | TEXT        | Testimonial content                              |
| `name`        | TEXT        | Title or short description                       |
| `designation` | TEXT        | Attribution (e.g., Joji, Pink Guy, Filthy Frank) |
| `image_url`   | TEXT        | URL to testimonial image                         |
| `created_at`  | TIMESTAMPTZ | Timestamp of creation (default: now)             |
| `updated_at`  | TIMESTAMPTZ | Timestamp of last update (default: now)          |
| `is_active`   | BOOLEAN     | Display control (default: `true`)                |
| `sort_order`  | INTEGER     | Display order for testimonials                   |

##### ✅ Policies & Indexes

- **RLS Enabled**
- **Admin Policy**: Full CRUD for logged-in users
- **Public Policy**: Read-only access to active testimonials
- **Indexes**: On `sort_order` and `is_active`

---

### ▶️ Run Locally

```bash
npm run dev
```

Then visit: [http://localhost:3000](http://localhost:3000)

---

### ☁️ Deploy with Vercel

1. Push your repo to GitHub
2. Go to [Vercel](https://vercel.com/) and import the project
3. In **Settings → Environment Variables**, add all vars from `.env.local`
4. Click **Deploy** to get your live app link

---

## 🧪 Contributing

We welcome feedback and collaboration!

- 🐞 Found a bug? Suggest improvements? [Open an issue](https://github.com/akshzyx/MusicArCH/issues)
- 💌 Contact: [work.groove816@passfwd.com](mailto:work.groove816@passfwd.com)

---

## ❤️ Built By Fans

JojiArCH is a community-driven, non-commercial tribute. No monetization, no affiliation — just pure appreciation for Joji’s art.

---
