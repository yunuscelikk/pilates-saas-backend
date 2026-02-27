# Pilates SaaS Backend

Multi-tenant SaaS CRM backend for Pilates studios. Shared DB / Shared Schema architecture with `studio_id` tenant isolation.

## Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Auth**: JWT (access + refresh token rotation)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env from example
cp .env.example .env
# Edit .env with your database credentials

# 3. Create PostgreSQL database
createdb pilates_saas

# 4. Run migrations
npm run db:migrate

# 5. Seed demo data
npm run db:seed

# 6. Start server
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm run db:migrate` | Run all pending migrations |
| `npm run db:migrate:undo` | Undo all migrations |
| `npm run db:seed` | Seed demo data |
| `npm run db:seed:undo` | Remove seeded data |

## API Reference

Base URL: `http://localhost:3000/api/v1`

### Auth (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new studio + owner |
| POST | `/auth/login` | Login |
| POST | `/auth/refresh` | Refresh token pair |
| POST | `/auth/logout` | Revoke refresh token |
| GET | `/auth/me` | Get current user |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

### Studios (Authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/studios/current` | Get current studio |
| PUT | `/studios/current` | Update current studio |

### Users (Owner only for write)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List users |
| GET | `/users/:id` | Get user |
| POST | `/users` | Create user |
| PUT | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |

### Members
Full CRUD at `/members`. Supports `?search=` query for name/email/phone filtering.

### Trainers
Full CRUD at `/trainers`.

### Classes
Full CRUD at `/classes`. Filter by `?classType=` and `?isActive=`.

### Class Sessions
Full CRUD at `/class-sessions`. Filter by `?startDate=`, `?endDate=`, `?status=`, `?classId=`, `?trainerId=`.

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bookings` | List bookings |
| GET | `/bookings/:id` | Get booking |
| POST | `/bookings` | Create booking (capacity check) |
| PATCH | `/bookings/:id/cancel` | Cancel (promotes waitlist) |

### Membership Plans
Full CRUD at `/membership-plans`. Filter by `?planType=`.

### Memberships
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/memberships` | List memberships |
| GET | `/memberships/:id` | Get membership |
| POST | `/memberships` | Create membership |
| PUT | `/memberships/:id` | Update membership |
| PATCH | `/memberships/:id/freeze` | Freeze membership |
| PATCH | `/memberships/:id/activate` | Reactivate membership |
| DELETE | `/memberships/:id` | Soft-delete |

### Payments (Immutable)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/payments` | List payments |
| GET | `/payments/:id` | Get payment |
| POST | `/payments` | Record payment |

### Attendances
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/attendances` | List attendances |
| POST | `/attendances/check-in` | Check in member |
| PATCH | `/attendances/:id/check-out` | Check out |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | List notifications |
| PATCH | `/notifications/:id/read` | Mark as read |
| PATCH | `/notifications/read-all` | Mark all as read |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/messages` | List messages |
| POST | `/messages` | Send message |
| PATCH | `/messages/:id/read` | Mark as read |

## Demo Credentials

After seeding:
- **Owner**: `owner@zenpilates.com` / `password123`
- **Staff**: `staff@zenpilates.com` / `password123`

## Pagination

All list endpoints support `?page=1&limit=20`. Response includes a `meta` object:

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```
