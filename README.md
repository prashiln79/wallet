Budget Tracker App - https://prashiln79.github.io/wallet/



Overview

The Budget Tracker is a financial management app built using Angular and Firestore. It helps users efficiently track their income and expenses, set budgets, and analyze spending trends.

Features

Income & Expense Tracking: Add, edit, and delete transactions.

Real-time Data Sync: Powered by Firestore for instant updates.

Budget Management: Set spending limits and track progress.

Charts & Analytics: Visualize financial trends.

User Authentication: Secure login with Firebase Authentication.

PWA Support: Installable on mobile and desktop for easy access.


Tech Stack

Frontend: Angular, Angular Material, Tailwind CSS

Backend: Firestore (NoSQL Database)

Authentication: Firebase Auth

Deployment: GitHub Pages


Installation

Prerequisites

Ensure you have the following installed:

Node.js (Latest LTS version)

Angular CLI

Firebase account and project setup


Steps

1. Clone the repository:

git clone https://github.com/prashiln79/wallet.git
cd wallet


2. Install dependencies:

npm install


3. Configure Firebase:

Create a Firebase project

Enable Firestore and Authentication

Add environment.ts file with Firebase credentials:

export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  }
};



4. Run the development server:

ng serve


5. Open in browser: http://localhost:4200



Deployment

To deploy the app to GitHub Pages:

ng build --configuration=production --output-path docs --base-href /wallet/
ngh --dir=docs

Contributing

Feel free to open issues or submit pull requests to improve the app!

License

This project is licensed under the MIT License.


---

🔗 Live Demo: Budget Tracker





Overview

The Budget Tracker is a financial management app built using Angular and Firestore. It helps users efficiently track their income and expenses, set budgets, and analyze spending trends.

Features

Income & Expense Tracking: Add, edit, and delete transactions.

Real-time Data Sync: Powered by Firestore for instant updates.

Budget Management: Set spending limits and track progress.

Charts & Analytics: Visualize financial trends.

User Authentication: Secure login with Firebase Authentication.

PWA Support: Installable on mobile and desktop for easy access.


Tech Stack

Frontend: Angular, Angular Material, Tailwind CSS

Backend: Firestore (NoSQL Database)

Authentication: Firebase Auth

Deployment: GitHub Pages


Installation

Prerequisites

Ensure you have the following installed:

Node.js (Latest LTS version)

Angular CLI

Firebase account and project setup


Steps

1. Clone the repository:

git clone https://github.com/prashiln79/wallet.git
cd wallet


2. Install dependencies:

npm install


3. Configure Firebase:

Create a Firebase project

Enable Firestore and Authentication

Add environment.ts file with Firebase credentials:

export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  }
};



4. Run the development server:

ng serve


5. Open in browser: http://localhost:4200



Deployment

To deploy the app to GitHub Pages:

ng build --configuration=production --output-path docs --base-href /wallet/
ngh --dir=docs

Contributing

Feel free to open issues or submit pull requests to improve the app!

License

This project is licensed under the MIT License.


---

🔗 Live Demo: Budget Tracker

