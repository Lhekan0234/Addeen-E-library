# Addeen E-Library Platform 📚

Addeen E-Library is a modern, web-based digital repository and publishing platform designed for academic research, global Islamic literature, and general books. Built with React and Firebase, the application offers role-based access control for **Readers** and **Authors**, integrated with Paystack for dynamic transaction processing and e-book downloads.

---

## ✨ Features

- **Role-Based Access Control (RBAC):**
  - **Readers:** Explore global literature across categories, filter works, and initiate payments via Paystack to unlock PDF downloads.
  - **Authors:** Access a dedicated publishing portal to upload PDF manuscripts, set metadata, and publish works live to the catalogue upon completing dynamic upload fees.
- **Categorized Digital Repository:**
  - Extensive collection spanning **Fiqh**, **Hadith**, **Seerah**, **Tafseer**, **Aqeedah**, **Children's Collection**, **Academic Research**, and **Novels & Literature**.
- **Integrated Payment Gateway:**
  - Seamless Paystack inline checkout routing for reader purchases and author upload fees.
- **Real-Time Database Sync:**
  - Dynamic Firestore integration merging baseline seed catalogues with live author uploads.
- **Institutional Civic UI:**
  - Light glassmorphic design featuring custom background themes (`lib_1.jpeg` and `lib_2.jpeg`).

---

## 🛠️ Tech Stack

- **Frontend:** React.js, React Router v6
- **Backend / BaaS:** Firebase (Authentication, Firestore Database, Firebase Storage)
- **Payment Processing:** Paystack SDK
- **Styling:** Custom CSS & Glassmorphism UI

---

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js and npm installed on your machine.

- Node.js (v14+)
- npm (v6+)

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/githubpage/your-repository.git]
   cd addeen-e-library