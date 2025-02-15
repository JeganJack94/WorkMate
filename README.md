# WorkMate
To track and manage stocks and checklist
Checklist and Stock Management App
This app is designed to help users manage stocks and checklists for various projects and systems. It integrates Firebase for authentication and database, and optionally uses an external cloud storage service (e.g., Cloudinary) for storing images.

Features
Project Management:

Create and manage projects.

Assign stocks and checklists to specific projects.

Stock Management:

Add and track stock data (Material Name, BOQ, Supplied Qty, Installed Qty, ATTIC Stock).

Checklist Management:

Add checklists with 7 checkpoints.

Mark checkpoints as complete and upload photo proofs.

Dashboard:

View an overview of all projects, stocks, and checklists.

Generate PDF reports for completed tasks.

Authentication:

User login and signup using Firebase Authentication.

Storage:

Upload and store images using an external cloud storage service (e.g., Cloudinary).

Technologies Used
Frontend:

React.js

Tailwind CSS

Vite (for fast development)

Backend:

Firebase Authentication

Firebase Firestore (Database)

External Cloud Storage (e.g., Cloudinary, AWS S3)

Other Tools:

React Router (for navigation)

React Icons (for icons)

React Toastify (for notifications)

Setup Instructions
1. Clone the Repository
bash
Copy
git clone https://github.com/your-username/checklist-stock-management-app.git
cd checklist-stock-management-app
2. Install Dependencies
bash
Copy
npm install
3. Set Up Firebase
Create a Firebase project at Firebase Console.

Add a web app to your Firebase project and copy the configuration.

Create a .env file in the root directory and add your Firebase credentials:

env
Copy
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
4. Set Up External Storage (Optional)
If using an external storage service (e.g., Cloudinary), add the credentials to the .env file:

env
Copy
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_API_KEY=your-api-key
VITE_CLOUDINARY_API_SECRET=your-api-secret
5. Run the App
bash
Copy
npm run dev
The app will be available at http://localhost:3000.

Usage
1. Authentication
Sign Up: Create a new account.

Log In: Log in with your credentials.

2. Projects
Create Project: Add a new project with a name and description.

View Projects: See a list of all projects.

3. Stock Management
Add Stock: Enter stock data (Material Name, BOQ, Supplied Qty, Installed Qty, ATTIC Stock) for a specific project and system.

View Stock: See a table of stock data for the selected project and system.

4. Checklist Management
Add Checklist: Add a checklist with 7 checkpoints for a specific project and system.

Mark as Complete: Mark checkpoints as complete and upload photo proofs.

View Checklist: See the checklist status and photo proofs.

5. Dashboard
Overview: View a summary of all projects, stocks, and checklists.

Generate Report: Generate a PDF report for completed tasks.

Folder Structure
Copy
src/
├── components/              # Reusable components
├── pages/                   # Main pages of the app
├── services/                # Firebase and external storage services
├── styles/                  # Global styles and Tailwind config
├── utils/                   # Utility functions
├── App.jsx                  # Main app component
├── main.jsx                 # Entry point
└── .env                     # Environment variables
Deployment
1. Build the App
bash
Copy
npm run build
2. Deploy to Firebase Hosting
Install Firebase CLI:

bash
Copy
npm install -g firebase-tools
Log in to Firebase:

bash
Copy
firebase login
Initialize Firebase Hosting:

bash
Copy
firebase init hosting
Deploy the app:

bash
Copy
firebase deploy
Contributing
Contributions are welcome! Follow these steps:

Fork the repository.

Create a new branch (git checkout -b feature/YourFeature).

Commit your changes (git commit -m 'Add some feature').

Push to the branch (git push origin feature/YourFeature).

Open a pull request.

License
This project is licensed under the MIT License. See the LICENSE file for details.

Contact
For questions or feedback, please contact:

Your Name

Email: your-email@example.com

GitHub: your-username

This README provides a comprehensive guide to setting up, using, and contributing to the app.
