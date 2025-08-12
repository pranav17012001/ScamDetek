# ScamDetek Backend Setup Guide

This guide explains how to set up the required environment files and certificates for running the ScamDetek backend.

## Prerequisites

- Python 3.11 or higher
- MySQL database access (Aiven service)
- Access to the team's Microsoft Teams channel

## Environment Variables (.env file)

The backend requires a `.env` file located in the `backend` directory. This file contains sensitive configuration data such as database credentials and API keys.

### How to obtain the .env file

1. Check the "Files" tab in our Microsoft Teams team channel for the `.env` file
2. Download the file and place it in the `backend` directory
3. DO NOT modify the file unless instructed by the team lead

### .env file structure

The `.env` file should contain the following variables:

```
# Database credentials
DB_HOST=mysql-2d8a3e22-fit5120-main-project.f.aivencloud.com
DB_USER=avnadmin
DB_PASSWORD=your_password_here
DB_NAME=defaultdb
DB_PORT=25968

# Other configuration variables
API_KEY=your_api_key_here
DEBUG=True
```

## SSL Certificate (ca.pem)

The backend requires an SSL certificate to securely connect to the Aiven MySQL database.

### How to obtain the certificate

1. Check the "Files" tab in our Microsoft Teams team channel for the `ca.pem` file
2. Download the file and place it in the `backend/certificates` directory
3. Ensure the file is named `ca.pem`

## Why these files are excluded from Git

Both the `.env` file and the `ca.pem` certificate are excluded from Git for the following security reasons:

1. **Protection of sensitive data**: These files contain credentials, API keys, and other sensitive information that should never be stored in public or shared repositories.

2. **Security best practices**: Storing credentials in source control is considered a security risk, as it exposes sensitive data to anyone with repository access.

3. **Environment-specific configuration**: Different team members may need slightly different configurations for local development.

4. **Preventing accidental credential leaks**: By keeping these files out of Git, we reduce the risk of accidentally pushing sensitive information to public repositories.

## Getting Started

After setting up the `.env` file and certificate:

1. Create a virtual environment (if not already done):

   ```bash
   cd backend
   python -m venv venv
   ```

2. Activate the virtual environment:

   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Run the backend server:

   ```bash
   python app.py
   ```

5. Test the database connection:
   - Navigate to http://localhost:8000/api/test-db
   - You should see a success message: `{"message":"Database connection successful!"}`

## Troubleshooting

If you encounter any issues with the backend setup:

1. Ensure the `.env` file and `ca.pem` certificate are properly placed in their respective directories
2. Check that the virtual environment is activated
3. Verify you have the latest version of the files from the Teams channel
4. Contact the team lead for assistance

## Additional Notes

- Never commit the `.env` file or `ca.pem` certificate to Git
- If you need to make changes to these files, coordinate with the team lead
- Regularly check the Teams channel for updates to these files
