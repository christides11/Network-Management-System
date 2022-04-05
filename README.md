# Network Management System

A network management system developed in Senior Project for Cisco.

## Requirements
- Python 3
- Node

## How to Use

### 1. Database Setup
1. Create a PostgreSQL database.
2. Use dbSetup.sql in /Server/ to create the needed tables.
3. (Optional) Use dbDummyData.sql in /Server/ to add initial data to the db.

### 2. Core Server & Probe Setup
1. in the main directory, do ```pip install -r requirements.txt```. This will install the needed dependencies.
2. In /Server/, create a env.json file.
3. Format your file based on /Server/env_template.json, filling env.json with your database login information.
4. In /Server/, do ```python core_server.py true```. This will start the core server along with a local probe.

### 3. Webserver Setup
1. In the main directory, do ```npm install```.
2. Once done, do ```npm start```. The webserver should run on the same device as the core server.