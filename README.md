YTM Rovers Hub
==============

Introduction
------------

YTM Rovers Hub is a web application designed to streamline the management of volunteer programs. The system facilitates volunteer sign-ups, program management, and aid material tracking. It provides distinct functionalities for team coordinators and volunteers, ensuring efficient and user-friendly interaction.

Table of Contents
-----------------

*   [Introduction](#introduction)
    
*   [Installation](#installation)
    
*   [Usage](#usage)
    
*   [Features](#features)
    
*   [Dependencies](#dependencies)
    
*   [Configuration](#configuration)
    
*   [Documentation](#documentation)
    
*   [Examples](#examples)
    
*   [Troubleshooting](#troubleshooting)
    
*   [Contributors](#contributors)
    
*   [License](#license)
    

Installation
------------

To set up the project locally, follow these steps:

1.  git clone https://github.com/aniqaqill/ytmrovershub.gitcd ytmrovershub
    
2.  npm install
    
3.  cp .env.example .env
    
4.  ./start-database.sh
    
5.  npm run dev
    

Usage
-----

Access the application by navigating to http://localhost:3000 in your web browser. Use the following functionalities:

*   **Register Account**: Create a new user account.
    
*   **Login**: Access the system with your credentials.
    
*   **Create Program**: Coordinators can create new volunteer programs.
    
*   **Manage Program**: Assign volunteers and track their progress.
    

Features
--------

*   **Volunteer Registration**: Easy sign-up and profile management for volunteers.
    
*   **Program Management**: Create, manage, and track volunteer programs.
    
*   **Aid Material Tracking**: Manage and distribute aid materials effectively.
    
*   **Role-based Access**: Different access levels for coordinators and volunteers.
    
*   **Certificate Generation**: Generate and send completion certificates to volunteers.
    

Dependencies
------------

*   **TypeScript**
    
*   **Next.js**
    
*   **Prisma**
    
*   **Tailwind CSS**
    
*   **PostgreSQL**
    

Refer to package.json for a complete list of dependencies.

Configuration
-------------

Update the .env file with your specific configuration:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   DATABASE_URL=postgresql://user:password@localhost:5432/yourdatabase  NEXT_PUBLIC_API_URL=http://localhost:3000/api   `

Documentation
-------------

For detailed documentation, refer to the following sections:

*   **API Documentation**: API Docs
    
*   **User Guide**: User Guide
    
*   **Developer Guide**: Developer Guide
    

Examples
--------

### Creating a Program

1.  Navigate to the "Create Program" section.
    
2.  Fill in the program details.
    
3.  Click "Submit" to save the program.
    

### Registering a Volunteer

1.  Go to the "Register" page.
    
2.  Fill out the registration form.
    
3.  Confirm your email to complete registration.
    

Troubleshooting
---------------

### Common Issues

*   **Database Connection Error**: Ensure your database URL in .env is correct and the database server is running.
    
*   **Server Not Starting**: Check if all dependencies are installed and the correct environment variables are set.
    

Contributors
------------

*   Aniq Aqill - [GitHub](https://github.com/aniqaqill)
    

License
-------

This project is licensed under the MIT License. See the LICENSE file for details.
