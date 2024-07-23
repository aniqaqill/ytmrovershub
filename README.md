# YTM Rovers Hub

## Introduction

YTM Rovers Hub is a web application designed to streamline the management of volunteer programs. The system facilitates volunteer sign-ups, program management, and aid material tracking. It provides distinct functionalities for team coordinators and volunteers, ensuring efficient and user-friendly interaction.

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Dependencies](#dependencies)
- [Configuration](#configuration)
- [User Manual for Application](#examples)
- [Troubleshooting](#troubleshooting)
- [Contributors](#contributors)
- [License](#license)

## Installation

To set up the project locally, follow these steps:

1. Clone the repository:
   ```
   git clone https://github.com/aniqaqill/ytmrovershub.git
   cd ytmrovershub
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env
   ```

4. Start the database:
   ```
   ./start-database.sh
   ```

5. Run the development server:
   ```
   npm run dev
   ```

## Usage

Access the application by navigating to `http://localhost:3000` in your web browser. Use the following functionalities:

- **Register Account**: Create a new user account.
- **Login**: Access the system with your credentials.
- **Create Program**: Coordinators can create new volunteer programs.
- **Manage Program**: Assign volunteers and track their progress.

## Features

- **Volunteer Registration**: Easy sign-up and profile management for volunteers.
- **Program Management**: Create, manage, and track volunteer programs.
- **Aid Material Tracking**: Manage and distribute aid materials effectively.
- **Role-based Access**: Different access levels for coordinators and volunteers.
- **Certificate Generation**: Generate and send completion certificates to volunteers.

## Dependencies

- **TypeScript**
- **Next.js**
- **Prisma**
- **Tailwind CSS**
- **PostgreSQL**

Refer to `package.json` for a complete list of dependencies.

## Configuration

Update the `.env` file with your specific configuration:

```
DATABASE_URL=postgresql://user:password@localhost:5432/yourdatabase
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Documentation

For detailed documentation, refer to the following sections:

- **API Documentation**: [API Docs]
- **User Guide**: [User Guide]
- **Developer Guide**: [Developer Guide]

## User Manual for Application

## Table of Contents

1. [Introduction](#1-introduction)
2. [Login Interface](#2-login-interface)
3. [Profile Management Interface](#3-profile-management-interface)
4. [Coordinator Dashboard Interface](#4-coordinator-dashboard-interface)
5. [Program Creation Interface](#5-program-creation-interface)
6. [Program Management Interface](#6-program-management-interface)
7. [Program Viewing Interface](#7-program-viewing-interface)
8. [Detailed Program Page](#8-detailed-program-page)
9. [Registered Programs Interface for Volunteers](#9-registered-programs-interface-for-volunteers)
10. [Program Completion Form Interface](#10-program-completion-form-interface)
11. [Completion Form Verification Interface](#11-completion-form-verification-interface)
12. [Aid Materials Management Interface](#12-aid-materials-management-interface)
13. [User Management Interface](#13-user-management-interface)

## 1. Introduction

Welcome to the application! This manual is designed to help you navigate and utilize the features of the system effectively. Whether you are a volunteer or a coordinator, this guide will walk you through each interface and its functionalities.

## 2. Login Interface

### Overview
The Login Interface allows users to access their accounts by entering their credentials.

### Steps to Log In
1. Open the application and navigate to the Login Interface.
2. Enter your username and password in the provided fields.
3. Click the "Login" button.
4. Volunteers will be redirected to the Volunteer Dashboard Interface.
5. Coordinators will be redirected to the Coordinator Dashboard Interface.

## 3. Profile Management Interface

### Overview
The Profile Management Interface allows you to update and manage your personal information.

### Steps to Manage Your Profile
1. Access the Profile Management Interface from your dashboard.
2. Update your personal and contact information as needed.
3. Click "Save" to apply your changes.
4. Your updated profile information will be reflected throughout the system.

## 4. Coordinator Dashboard Interface

### Overview
The Coordinator Dashboard Interface provides coordinators with an overview of their managed programs and other relevant details.

### Features
- View a list of programs you manage.
- Access program details.
- Review completion forms submitted by volunteers.
- Manage aid materials and perform administrative tasks.

## 5. Program Creation Interface

### Overview
The Program Creation Interface enables coordinators to create new programs.

### Steps to Create a Program
1. Navigate to the Program Creation Interface.
2. Enter program details such as name, date, time, location, and additional information.
3. Set the maximum number of participants and select required aid materials.
4. Click "Create" to add the program to your list of managed programs.

## 6. Program Management Interface

### Overview
The Program Management Interface allows coordinators to edit and manage existing programs.

### Steps to Manage a Program
1. Select a program from your list of managed programs.
2. Access its details and make necessary changes.
3. Update the program status, participant limit, and manage associated resources.
4. Save your changes to update the program information.

## 7. Program Viewing Interface

### Overview
The Program Viewing Interface allows both volunteers and coordinators to view program details.

### Features
- Search or browse programs.
- View program information including name, date, time, and location.
- Get an overview of the program's purpose and requirements.

## 8. Detailed Program Page

### Overview
The Detailed Program Page provides comprehensive information about each program.

### Features
- View detailed program information such as purpose, location, date, time, and agenda.
- Access associated documents and resources.
- Click "Register" to join the program.

## 9. Registered Programs Interface for Volunteers

### Overview
The Registered Programs Interface shows a list of programs that the volunteer is currently registered for.

### Features
- View the list of registered programs.
- Access program details and retrieve relevant information such as agenda and contact details.

## 10. Program Completion Form Interface

### Overview
The Program Completion Form Interface allows volunteers to submit forms for completed programs.

### Steps to Submit a Completion Form
1. Access the completion form for a specific program.
2. Fill in the required details such as date of completion and feedback.
3. Upload any necessary images as evidence.
4. Submit the form for review.

## 11. Completion Form Verification Interface

### Overview
The Completion Form Verification Interface enables coordinators to verify submitted completion forms.

### Steps to Verify a Completion Form
1. Review the completion forms received for a program.
2. Validate the information and check attached images.
3. Mark the form as verified or incomplete.

## 12. Aid Materials Management Interface

### Overview
The Aid Materials Management Interface allows coordinators to manage aid materials.

### Features
- View current inventory and update quantities.
- Track distribution records and handle requests for additional materials.

## 13. User Management Interface

### Overview
The User Management Interface is used by system administrators to manage coordinator accounts.

### Features
- Create new coordinator accounts.
- Update existing coordinator information.
- Ensure effective administration and oversight.

## Troubleshooting

### Common Issues

- **Database Connection Error**: Ensure your database URL in `.env` is correct and the database server is running.
- **Server Not Starting**: Check if all dependencies are installed and the correct environment variables are set.

## Contributors

- Aniq Aqill - [GitHub]

## License

This project is licensed under the MIT License. See the [LICENSE] file for details.
