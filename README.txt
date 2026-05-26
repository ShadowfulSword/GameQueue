================================================================
GameQueue - README
Group 10: Team Iron Lung
Ayush Kafley, Muzzammil Nawab, Jake Emmert, Alec DeLaurentis
================================================================

================================================================
Requirements
================================================================
The following libraries must be installed before running GameQueue
    - Python 3.12
    - MySQL 8.0
    - Node.js 20.0

================================================================
Database Setup
================================================================

    - Open MySQL and run the following comman dto create the database:

        CREATE DATABASE GameQueue;
    
    - Run the schema file to create all table"

        Navigate to GameQueue/backend/DB
        Run GameQueue.sql in MySQL Workbench or in the terminal

================================================================
Enviroment file setup
================================================================

    - Navigate to GameQueue/backend
    - Create a file named ".env"
    - Populate the .env file as such

        STEAM_API_KEY = YOUR_STEAM_API_KEY
        STEAM_ID = YOUR_STEAM_ID
        DB_HOST = localhost
        DB_PORT = 3306
        DB_USER = root
        DB_PASSWORD = YOUR_MYSQL_PASSWORD
        DB_NAME = GameQueue

    Your Steam API can be found by applying for on at: 
        https://steamcommunity.com/dev/apikey

    Your Steam ID can be found in your Account details in Steam

    Set your Steam profile and game to PUBLIC so your library can be imported

        The option for this an be found in Steam -> Profile -> Edit Profile -> Privacy setting

================================================================
Install all Python Requirements
================================================================

    Navigate to GameQueue/backend and in your terminal run:
        
        pip install -r requirements.txt

================================================================
Start the backend
================================================================

    Navigate to GameQueue/backend and in your terminal run:

        uvicorn api.routes:app

    The backed can be viewed at http://localhost:8000
    The API routes can be viewed at http://localhost:8000/docs

================================================================
Start the frontend
================================================================

    Navigate to GameQueue/frontend/ and run:

        npm install 
        npm run dev

    The frontend will be avalible at http://localhost:5173/

================================================================
Running unit tests
================================================================
    
    Navigate to GameQueue/backed/ and in your terminal run:

        pytest test_gamequeue.py -v 
    
    to run the system test_gamequeue

    In the same directory run the follolwing in your terminal:

        pytest test_integration.py -v 
    
    to run the integration tests


================================================================
FILE STRUCTURE
================================================================
├── backend
│   ├── algorithm
│   │   └── recommender.py  -- Cosine similarity rec algorithm
│   ├── api
│   │   ├── __init__.py
│   │   └── routes.py       -- FastAPI routes
│   ├── DB
│   │   ├── connections.py  -- MySQL connection handler
│   │   ├── GameQueue.sql   -- All database query functions
│   │   └── queries.py      -- Database schema
│   ├── hltb_data.csv       -- The CSV containingall of the 
│   ├── import_hltb.py      --Hltb CSV import pipeline
│   ├── main.py             --Libray impoprt pipeline entry
│   ├── requirements.txt    --List of python dependecies
│   ├── Steam
│   │   ├── clients.py      --Steam API calls
│   │   └── parser.py       --Steam API response parser
│   ├── test_gamequeue.py   --Unit testing for other finction
│   ├── test_integration.py --Unit testing for integration
|   └── .env                --The env file you must create
├── frontend
│   ├── eslint.config.js    -- Basic setup inclueded with fastapi dummy setup
│   ├── index.html          -- Basic setup inclueded with fastapi dummy setup
│   ├── package.json        -- Basic setup inclueded with fastapi dummy setup
│   ├── package-lock.json   -- Basic setup inclueded with fastapi dummy setup
│   ├── public
│   │   └── GameQueueLogo.png   -- Custom created logo for GameQueue
│   ├── README.md           -- Basic setup inclueded with fastapi dummy setup
│   ├── src
│   │   ├── api
│   │   │   └── index.js    -- Axios API call functions
│   │   ├── App.jsx         -- React Router setup
│   │   ├── index.css       -- Basic setup inclueded with fastapi dummy setup
│   │   ├── main.jsx        -- React entry point
│   │   └── pages
│   │       ├── GenreSelect.jsx             -- Onboarding GenreSelect
│   │       ├── GenreSelect.module.css      -- Style Sheet for GenreSelect 
│   │       ├── Landing.jsx                 -- Steam ID input and imprort page
│   │       ├── Landing.module.css          -- Style sheet for Steam ID input and imprort page
│   │       ├── Library.jsx                 -- Full game libarary page with filters
│   │       ├── Library.module.css          -- Style Sheet for Full game libarary page with filters
│   │       ├── Profile.jsx                 -- Profile tab that lets you edit chosen genres
│   │       ├── Profile.module.css          -- StyleSheet for Profile tab that lets you edit chosen genres
│   │       ├── Queue.jsx                   -- Top 5 recommendation page
│   │       ├── Queue.module.css            -- Style sheet for Top 5 recommendation page
│   │       ├── StatusSetup.jsx             -- Onboarding status setup page
│   │       └── StatusSetup.module.css      -- Style Sheet for Onboarding status setup page
│   └── vite.config.js
└── README.txt

================================================================
EXAMPLE STEAM IDs FOR TESTING
================================================================

    The following Steam account can be used for testing: 
    
        76561198123575176
    
    Please make sure any non proided steam ID used has the profile set to public as described earlier
    Also note that the first import may take up to several minuets due to API calls
    
