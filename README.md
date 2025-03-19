# Market Auth Service

This service is responsible for managing the authentication of the users of the Market application.

> ⚠️ **Work In Progress**: This service is currently under active development and not ready for production use. Features may change and some functionality might be incomplete.

## Architecture

```mermaid

```

## Prerequisites
- [Node.js](https://nodejs.org)
- [Docker](https://docker.com)
- [Bun](https://bun.sh)

## Features
- User Registration
- User Login
- JWT Token Generation
- JWT Token Validation

## Technologies
- [Node.js](https://nodejs.org)
- [Bun](https://bun.sh)
- [Express.js](https://expressjs.com)
- [PostgreSQL](https://postgresql.org)
- [Drizzle](https://drizzle.org)
- [JWT](https://jwt.io)

## Setup
1. Clone the repository

```bash
git clone https://github.com/conceptcodes/market-auth-service.git
```

2. Install dependencies

```bash
bun install
```

3. Environment Setup


3. Run the application

```bash
bun run docker
```

4. Access the application on `http://localhost:8000`

## API Endpoints

### User Registration

```
POST /api/auth/register
```
```json
{
  "message": "User registered successfully",
}
```

### User Login

```
POST /api/auth/login
```
```json
{
  "message": "User logged in successfully",
}
```

## Roadmap
- [ ] Unit Testing
- [ ] Database Sessions