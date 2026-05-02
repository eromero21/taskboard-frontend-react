# Project Brief Summary
## Frontend portion of Kanban web application
* Account creation & login functionality
* Board creation and selection for different goals
* Full task card CRUD functionality
* Drag and drop implementation for easily moving cards between column types

<img src="./src/assets/taskboard_login.gif" width="600" 
style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">

<br>

# Tech Stack
* React
* Vite
* JavaScript
* HTML/CSS

<br>

# Setup

### Prerequisites
- Node.js and npm
- Git
- A running local copy of the Taskboard backend

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd taskboard-frontend-react
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the backend
This frontend depends on the Taskboard backend API running locally.

Set up and start the backend first:

`https://github.com/eromero21/taskboard-backend-springboot`

The frontend currently expects the backend to be available at:

- `http://localhost:8080`

If your backend is running on a different URL, update the `URL` value in `src/api/fetcherAuth.js` before starting the frontend.

### 4. Run the frontend
```bash
npm run dev
```

Vite will start the app locally, typically at `http://localhost:5173`.

### 5. Verify the app is running
Open the Vite URL in your browser and confirm that you can:

- Create an account
- Log in
- View boards
- Create and move task cards

### Notes
- Authentication tokens are stored in `localStorage`.
- The backend project is configured to allow CORS requests from `http://localhost:5173`.

<br>

# Stuff I learned
I have learned a lot especially in regards to react component usage and modularizing items so files do not become too congested. There is certainly further room for improvement and I am excited to continue working with the tech stack.
