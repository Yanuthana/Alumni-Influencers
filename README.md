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

The daily winner selection is handled by a cron job. You can manually trigger it using:
```bash
php index.php cron select_winner
```
Or via the web:
`http://your-domain/cron/select_winner`

## 🛠 Features

- **Alumni Management**: Track and manage alumni profiles.
- **Bidding System**: Automated bidding for various slots.
- **Winner Selection**: Automated daily selection of winners.
- **API Documentation**: Integrated Swagger UI for API reference.

