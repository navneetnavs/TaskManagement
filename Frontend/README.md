Task Management Application  
A full-stack task management solution built with modern web technologies. This application gives users an easy-to-use interface to create, manage, and track their tasks effectively. The platform supports user authentication with email/password and Google OAuth for secure access to personal task lists.  

Getting Started  
Prerequisites  
Before you start, make sure you have Node.js (v14 or higher) and npm (v6 or higher) installed on your system. You will also need a MongoDB database, which can be set up locally or with MongoDB Atlas.  

Local Setup  
Backend Setup: Go to the Backend directory and install the required dependencies using npm install. Create a .env file in the Backend directory with the necessary environment variables, including PORT, MONGODB_URI, JWT_SECRET, and Google OAuth credentials. Start the development server with npm run server to launch the backend service at http://localhost:5001.  
Frontend Setup: Move to the Frontend directory and install dependencies using npm install. Configure the .env file with VITE_API_URL pointing to your backend server and include your Google OAuth client ID. Start the development server with npm run dev to access the application at http://localhost:5173.  


API Documentation  
The backend offers a RESTful API with the following endpoints:  

Authentication: /api/auth/register for user registration, /api/auth/login for email/password login, and /api/auth/google for OAuth authentication.  
Tasks: Endpoints for CRUD operations on tasks, including status updates and filtering options.  
Each endpoint requires proper authentication via JWT tokens, which the frontend manages automatically after successful login. The API follows REST conventions and returns JSON responses with the appropriate HTTP status codes.  

Deployment  
For production deployment, configure environment variables with production database credentials and secrets. You can build the frontend using npm run build, which generates optimized static files in the dist directory. Deploy the backend to a Node.js hosting provider with MongoDB access.  

Technologies  
The application uses a modern technology stack, including React for the frontend, Node.js with Express for the backend, and MongoDB for data storage. Styling is handled by Tailwind CSS, while authentication is managed through JWT and Google OAuth 2.0.