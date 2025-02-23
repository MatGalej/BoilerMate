# BoilerMates

**BoilerMates** is a roommate matching application designed to help Purdue students find compatible roommates, and as the (superior) option for finding roommates at Purdue! 

It was created as part of the 2025 Boilermake Hackathon at Purdue University.

## Table of Contents

## Features

- **User Authentication:** Secure sign-up and login using Firebase Authentication.
- **Profile Management:** Create and update your profile with personal details and living preferences.
- **Roommate Matching:** Find compatible roommates based on mutual preferences and habits.
- **Chat & Friend Management:** Connect with potential roommates via real-time chat, send friend requests, and manage blocked users.
- **User Questionare** Extensive user questionaire used to guage the best potential matches in roomates

## Tech Stack

- **React** for the front-end
- **Firebase** (Authentication, Firestore Database)
- **React Router** for navigation
- **Xenova all-MiniLM** for Natural Language Processing (NLP) of user's questionare data

## Prerequisites
- **Node.js** (v14+ recommended)
- **npm**
- A **Firebase** project configured with Firestore and Authentication enabled
- **Xenova all-MiniLM** for NLP

## Installation Steps
1. Fork, then cLone the repository
2. install the mentioned dependencies via ```npm install```
3. Run the program with ```cd .\boiler-mate\ && npm start```
4. Enjoy :)

## File structure
```
boilermates/
├─ public/
│   └─ index.html
│   └─ manifest.json
│   └─ logo.svg
│   └─ robots.txt
├─ src/
│   ├─ components/
│   ├─ pages/
│   │   ├─ Home.js
│   │   ├─ Profile.js
│   │   ├─ Friends.js
│   │   └─ ...
│   ├─ css/
│   │   ├─ home.css
│   │   ├─ chat.css
│   │   └─ ...
│   ├─ firebaseConfig.js
│   ├─ App.js
│   └─ index.js
├─ package.json
└─ README.md
```

We hope you enjoy! 
