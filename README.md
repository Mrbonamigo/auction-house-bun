# 💎 AuctionHouse

A high-performance, full-stack auction platform built with **Bun**, **React**, and **SQLite**.

AuctionHouse simulates a luxury bidding environment with **real-time updates**, **ACID-compliant financial transactions**, and a seamless user experience.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Key Features

- **🛡️ Secure Authentication**: Hybrid login system supporting both **Email/Password** and **Google OAuth** (via Better-Auth).
- **⚡ Real-Time Bidding**: Interfaces update instantly using optimized polling and optimistic UI updates via TanStack Query.
- **🏦 ACID Transactions**: Financial integrity is guaranteed using SQLite atomic transactions. A bid only counts if the wallet balance deduction and the previous bidder refund happen simultaneously.
- **💰 Digital Wallet**: Built-in wallet system to deposit funds and track spending.
- **📸 Image Uploads**: Native file handling for listing new auction items.
- **🔍 Search & Filtering**: Dynamic SQL generation for filtering items by price, recency, and ending time.
- **📱 Responsive UI**: "Dark Luxury" aesthetic built with **Tailwind CSS**, featuring skeleton loading states and custom 404 pages.

## 🛠️ Tech Stack

### Backend (The Engine)
- **Runtime**: [Bun](https://bun.sh/) (Fast all-in-one JavaScript runtime)
- **Database**: `bun:sqlite` (Native, high-performance SQLite driver)
- **Auth**: [Better-Auth](https://www.better-auth.com/)

### Frontend (The Interface)
- **Framework**: React 18
- **State Management**: [TanStack Query](https://tanstack.com/query) (React Query)
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM

---

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites
- You need to have **[Bun](https://bun.sh/)** installed (`powershell -c "irm bun.sh/install.ps1 | iex"` on Windows).

### 1. Clone the repository
```bash
git clone [https://github.com/YOUR_USERNAME/auction-house-bun.git](https://github.com/YOUR_USERNAME/auction-house-bun.git)
```
2. Install Dependencies
```bash bun install ```


3. Setup the Database
We need to create the tables and seed the database with initial products.

```bash
Create the Schema (Tables)
bun src/setup.ts

Seed with Dummy Data (Products)
bun src/seed.ts 
```

4. Run the Application
You need two terminals running simultaneously:

Terminal 1: The Backend Server ```bash bun run server ``` Runs on http://localhost:3000

Terminal 2: The Frontend Client (Bundler) ```bash] bun run client ``` Watches for changes and rebuilds the React app.

🧠 Architectural Highlights
The ACID Transaction Logic
One of the core challenges of an auction system is handling concurrency (two people bidding at the same time) and financial consistency.

This project solves it using SQLite Transactions:

```typescript] // src/server/index.ts (Simplified) 
const result = db.transaction(() => 
{ // 1. Validate Product & Time 
// 2. Validate Wallet Balance 
// 3. Refund the previous bidder (Atomic) 
// 4. Deduct from current user (Atomic) 
// 5. Insert new Bid (Atomic) })(); 
```

If any step fails, the entire operation is rolled back, ensuring no money is ever lost.

📄 License
This project is open-source and available under the MIT License.
