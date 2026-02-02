# Skye Travel Solution

A premium travel agency website featuring dynamic destinations, bookings, and interactive maps.

## 🚀 Demo
[Live Demo Link (Add yours after deploy)]

## 🛠️ Setup Locally

1.  Clone the repo:
    ```bash
    git clone https://github.com/DataIsFuture23/SkyeTravels.git
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the server (requires SQL Server):
    ```bash
    node server.js
    ```

## ☁️ Deploy to Vercel

This project is designed to fall back to **Offline Mode** if the database is not available, making it perfect for static hosting on Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FDataIsFuture23%2FSkyeTravels)

**Note:** The "Login" and "Book Now" features require a backend database and will not function in the static Vercel deployment. The "View Details" and destination gallery will work normally.
