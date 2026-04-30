# Alumni Influencers

A platform for managing and connecting with alumni influencers, including automated bidding and winner selection systems.

## 🚀 Getting Started

### Prerequisites

- PHP 7.4+
- MySQL/MariaDB
- XAMPP / WAMP / MAMP or any local PHP server
- Composer

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   composer install
   ```
3. Set up your environment variables:
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your local configuration (Database, SMTP, Kong, etc.)
4. Set up the database:
   - Import `schemas.sql` into your MySQL database.
5. Configure your web server to point to the project root.

## 📧 Email Configuration

The project uses Mailtrap for testing emails in the development environment. You can update your SMTP credentials in the `.env` file under the `Email Configuration` section.

## 🤖 Automation (Cron Jobs)

The daily winner selection and slot automation are handled by a cron job. You can manually trigger it using:

```bash
# Using the bootstrap script (Recommended for CLI)
/Applications/XAMPP/xamppfiles/bin/php /Applications/XAMPP/xamppfiles/htdocs/Alumni-Influencers/cron_winner.php

# Or via native CodeIgniter CLI
php index.php cron winner_selection
```

### Crontab Configuration
To automate this, add the following line to your crontab (`crontab -e`):
```bash
0 18 * * * /Applications/XAMPP/xamppfiles/bin/php /Applications/XAMPP/xamppfiles/htdocs/Alumni-Influencers/cron_winner.php >> /tmp/alumni_winner_cron.log 2>&1
```

## 🔒 Kong API Gateway Setup

The application uses **Kong API Gateway** to secure its APIs and manage API Keys. Certain endpoints are protected and only accessible via Kong.

### Prerequisites

- [Kong Gateway](https://docs.konghq.com/gateway/latest/install-and-run/) (OSS or Enterprise) installed and running.
- **Key-Auth Plugin**: Must be enabled on your service/routes.

### Configuration

1. **Update .env**:
   Ensure your `KONG_ADMIN_URL` is set to your Kong Admin instance (default is `http://127.0.0.1:8001`).
   ```env
   KONG_ADMIN_URL=http://127.0.0.1:8001
   ```

2. **Consumer Management**:
   The application handles consumer creation automatically via the `ApiKeyManager` controller when generating or listing keys for a user.

3. **Required Headers**:
   When routing through Kong, the gateway should be configured to forward the following headers to the application:
   - `X-Consumer-Username`
   - `X-Consumer-ID`
   - `X-Kong-Request-Id` (optional, for tracing)

### How it Works

- **Verification**: The `BaseApiController` and specific controllers (like `ViewWinner`) check for Kong-specific headers to ensure the request is proxied correctly.
- **Key Management**: Developers can manage their API keys through the `/api/keys` endpoints, which communicate directly with Kong's Admin API.

## 🛠 Features

- **Alumni Management**: Track and manage alumni profiles.
- **Bidding System**: Automated bidding for various slots.
- **Winner Selection**: Automated daily selection of winners.
- **API Documentation**: Integrated Swagger UI for API reference.

