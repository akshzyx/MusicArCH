# JojiArCH 🎵

_A fan-made archive celebrating Joji's musical evolution through his iconic eras._

<!-- [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fakshzyx%2FMusicArch)   -->

🌐 **Live Site**: [JojiArCH](https://jojiarch.vercel.app)

![JojiArCH](https://github.com/user-attachments/assets/853b6f71-8614-4a95-9887-d6f61379fa34)

---

## About JojiArCH

JojiArCH is a dedicated archive documenting Joji’s musical journey—from his lo-fi beginnings to his rise as a global R&B/pop artist. Explore his discography through curated eras, unreleased tracks, and behind-the-scenes insights.

### Mission

To preserve Joji’s artistic legacy and provide fans with an immersive, organized experience of his work.

---

## Features ✨

- **Era-Based Navigation**: Explore Joji’s music through distinct creative phases.
- **Comprehensive Tracklists**: Released songs, unreleased gems, stems, and sessions.
- **Audio Player**: Stream tracks directly on the site.
- **Community Contributions**: Suggest edits or additions (coming soon!).

---

## Joji’s Musical Journey

Born George Kusunoki Miller, Joji transitioned from internet comedy (Filthy Frank) to music in 2017 with _In Tongues_. Key milestones:

- 🎶 **Ballads 1 (2018)**: First Asian artist to top Billboard’s R&B/Hip-Hop chart (_Slow Dancing in the Dark_).
- 🍯 **Nectar (2020)**: Genre-blending masterpiece (_Run_, _Gimme Love_).
- 🔄 **Smithereens (2022)**: Raw emotional depth (_Glimpse of Us_).

---

## Tech Stack ⚙️

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **Database**: Supabase
- **Hosting**: Vercel

---

## Contribute 🤝

JojiArCH is built by fans, for fans. Want to help?

- 🐛 **Report bugs or suggest features**: Open a [GitHub Issue](https://github.com/akshzyx/MusicArch/issues).
- 💡 **Email**: `work.groove816@passfwd.com`.

---

## Data Structures used for Supabase

### Release Table (for tracks)

| Field         | Type          | Description                                       |
| ------------- | ------------- | ------------------------------------------------- |
| `id`          | `number`      | Unique identifier for the release.                |
| `era_id`      | `string`      | Identifier linking to the associated era.         |
| `title`       | `string`      | Track title.                                      |
| `duration`    | `string`      | Duration of the track (e.g., "3:45").             |
| `file`        | `string`      | File path or URL for the track.                   |
| `cover_image` | `string`      | URL or path to the cover image.                   |
| `og_filename` | `string?`     | Original filename (optional).                     |
| `file_date`   | `string?`     | Date associated with the file (optional).         |
| `leak_date`   | `string?`     | Date the track was leaked (optional).             |
| `aka`         | `string?`     | Alternate name or alias for the track (optional). |
| `category`    | `string?`     | Category of the release.                          |
| `type`        | `string?`     | Type of release (optional).                       |
| `track_type`  | `string?`     | Type of track (optional).                         |
| `credit`      | `string?`     | Credits for the track (optional).                 |
| `multi_files` | `JsonFolder?` | JSON object for multiple files (optional).        |
| `available`   | `string?`     | Availability status (optional).                   |
| `quality`     | `string?`     | Quality of the track (optional).                  |
| `notes`       | `string?`     | Additional notes about the release (optional).    |

### Era Table (for albums)

| Field         | Type      | Description                                          |
| ------------- | --------- | ---------------------------------------------------- |
| `id`          | `string`  | Unique identifier for the era.                       |
| `title`       | `string`  | Title of the era.                                    |
| `description` | `string?` | Description of the era (optional).                   |
| `cover_image` | `string`  | URL or path to the cover image for the era.          |
| `start_date`  | `string?` | Start date of the era (optional).                    |
| `end_date`    | `string?` | End date of the era (optional).                      |
| `album_rank`  | `number`  | Rank or order of the era (e.g., for sorting albums). |

---
