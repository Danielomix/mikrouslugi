<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->
- [x] Verify that the copilot-instructions.md file in the .github directory is created.

- [x] Clarify Project Requirements

- [x] Scaffold the Project

- [x] Customize the Project

- [x] Install Required Extensions

- [x] Compile the Project

- [x] Create and Run Task

- [x] Launch the Project

- [x] Ensure Documentation is Complete

## Project-Specific Instructions

This is a microservices project with the following architecture:
- **Backend**: Node.js + Express.js for REST APIs
- **Database**: MongoDB with Mongoose ORM  
- **Authentication**: JWT tokens with bcrypt for password hashing
- **Service Communication**: REST API (HTTP + JSON)
- **API Gateway**: Express Gateway for request routing
- **Containerization**: Docker with Docker Compose
- **Documentation**: Swagger UI/OpenAPI for API documentation
- **Testing**: Postman collections for manual API testing

Key Services:
1. User Authentication Service (JWT, bcrypt, user management)
2. Product/Catalog Service (example business service)
3. API Gateway (Express Gateway for routing)
4. Shared utilities and middleware

Technologies:
- axios/fetch for inter-service communication
- mongoose for MongoDB ORM
- jsonwebtoken for JWT handling
- bcrypt for password hashing
- Docker & Docker Compose for containerization
- Swagger for API documentation