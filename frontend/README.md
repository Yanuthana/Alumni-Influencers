# Alumni Influencers - Frontend

This is the React-based frontend for the Alumni Influencers platform, built with **Vite**, **Tailwind CSS**, and **Material Symbols**. It provides a premium, high-performance interface for alumni and students to interact with the bidding and mentorship ecosystem.

## 🚀 Getting Started

### 1. Prerequisites (What to start first)
Before running the frontend, ensure your local development environment is ready:

1.  **XAMPP / PHP Server**: 
    *   Start **XAMPP Control Panel**.
    *   Ensure **Apache** and **MySQL** are running.
    *   The backend should be accessible (usually at `http://localhost/Alumni-Influencers/`).
2.  **Database**:
    *   Ensure your MySQL database is active and the schemas from the project root have been imported.
3.  **Node.js**:
    *   Ensure you have Node.js (v18+) installed on your machine.

### 2. Installation
Navigate to the frontend directory and install the necessary dependencies:

```bash
cd frontend
npm install
```

### 3. Environment Configuration
Ensure you have a `.env` file in the `frontend/` directory with the necessary API keys and base URLs:

```env
VITE_API_BASE_URL=http://localhost/Alumni-Influencers
VITE_GATEWAY_API_KEY=your_gateway_key_here
```

### 4. Running the Development Server
Start the Vite development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The application will typically be available at `http://localhost:5173`.

---

## 🛠 Project Structure

- `src/pages/`: Contains the main view components (Home, Dashboard, Bidding, etc.).
- `src/services/`: API service layers for communicating with the PHP backend.
- `src/components/`: Reusable UI components (Modals, Cards, Navbars).
- `src/assets/`: Static assets and global CSS.

## 📅 Automatic Features
- **Featured Alumni**: The Home page automatically determines whether to show yesterday's or today's winner based on the 6:00 PM (local time) cutoff. No manual date selection is required.

## 📜 Available Scripts

| Script | Description |
| :--- | :--- |
| `npm run dev` | Starts the development server. |
| `npm run build` | Builds the application for production. |
| `npm run preview` | Locally previews the production build. |
| `npm run lint` | Runs ESLint to check for code quality issues. |
