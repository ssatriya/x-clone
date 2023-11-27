---
title: "X Clone App 🐦"
tags: [React, Zustand, Next.js, MySQL, Planetscale, Twitter-clone, X-clone]
---

# Twitter Clone App 🚀

Welcome to the X Clone App (formerly known as Twitter) repository! This project aims to replicate the core functionalities of X, providing users with a platform to share their thoughts, follow others, and engage in meaningful conversations.

## Features 🌟

- **User Authentication:** Secure user authentication and authorization system to ensure a personalized experience. Using SSO via Gmail to make authentication easier.
- **Posting:** Post your thought, including text and multimedia content (Image), with real-time updates accross user.
- **Follow and Unfollow:** Build a network by following and unfollowing other users.
- **Responsive Design:** Ensure a seamless experience across devices.

## Tech Stack 🛠️

- **Frontend:** React, Zustand for state management, NextUI for styling with Tailwind CSS.
- **Backend:** Next.js for connection between the frontend.
- **Database:** MySQL for efficient data storage, via Planescale service.
- **Real-Time Updates:** Using UseSWR and Tanstack Query package to give a real-time user experience.

## TODO 📝

- [ ] Improve code, use refactor component to make it more reuseable, readable and easy to understand.
- [ ] Implement followed only homepage.
- [ ] Add real-time updates for notifications.
- [ ] Add upload video functionality.
- [ ] Implement S3 as media storage (currently using Uploadthing.io).
- [ ] Implement unit and integration testing (as part of my learning).

## Getting Started 🚀

1.  Clone the repository:

    ```bash
    git clone https://github.com/ssatriya/x-clone

    ```

2.  Open the project:

    ```bash
    cd twitter-clone
    npm install
    ```

3.  Create the .env file
4.  Start the project
    ```bash
    npm run dev
    ```
