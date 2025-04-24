
# Uniloop: A Seamless Academic Management App

Uniloop is a user-friendly student app designed to optimize classroom management and academic workflows within universities. This all-in-one platform simplifies daily activities like tracking assignment deadlines, setting reminders, and booking classrooms. It also facilitates dynamic tasks such as scheduling teacher-student meetings, managing announcements, and enabling peer-to-peer academic discussions.


## Environment Variables

To run this project, you will need to add the following environment variables to your .env files

### Backend

`PORT`

`ENVIRONMENT` : `DEVELOPMENT | PRODUCTION | null `

`MONGODB_URI`

`JWT_SECRET`

`AWS_ACCESS_KEY_ID`

`AWS_SECRET_ACCESS_KEY`

`AWS_REGION`

`AWS_BUCKET_NAME`

`EXPO_ACCESS_TOKEN`

### Frontend

`EXPO_PUBLIC_API_URL` : `http://10.31.6.6:5000/api`


## To run this project locally

1. Clone the project

    ```bash
    git clone
    ```

2. Go to the backend directory

    ```bash
    cd uniloop/backend
    ```

    Install dependencies for the backend

    ```bash
    npm install
    ```

    Start the server [make sure you env files has all the required variables]

    ```bash
    npm run start
    ```

3. Go to the frontend directory

    ```bash
    cd uniloop/frontend
    ```

    Install dependencies for the frontend

    ```bash
    npx expo install
    ```

    Prebuild the project
    ```bash
    npx expo prebuild
    ```

    Connect to a emulator or phone and run the app
    ```bash
    npx expo run:android/ios
    ```



## FAQ

#### How to enable notifications?

You have to first download the google-services.json file and add it to the android/app folder 

