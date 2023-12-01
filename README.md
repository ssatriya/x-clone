# Twitter Clone App 🚀

Welcome to the X Clone App (formerly known as Twitter) repository! This project aims to replicate the core functionalities of X, providing users with a platform to share their thoughts, follow others, and engage in meaningful conversations.

## Features 🌟

- **Authentication:** User authentication using Gmail with [Lucia Auth](https://lucia-auth.com/){:target="\_blank"}.
- **Posting:** Post your thought, including text and multimedia content (image), with real-time updates accross user.
- **Follow and Unfollow:** Build a network by following and unfollowing other users.
- **Like, Quote and Repost:** Real-time update for like, quote and repost that also appear in your profile
- **Change Profile Photo, Background and Bio:** Personalize your profile with your favorite photo, background and bio that suit you.
- **Responsive Design:** Ensure a seamless experience across devices.

## Tech Stack 🛠️

- **Frontend:** React, Zustand for state management, NextUI for styling with Tailwind CSS.
- **Backend:** Next.js for all the process that require to display data in the frontend.
- **Database:** MySQL for data storage, via Planescale service.
- **Real-Time Updates:** Using UseSWR and Tanstack Query package to give a real-time user experience.

## TODO 📝

- [ ] Improve code, refactor component to make it more reuseable, readable and easy to understand.
- [ ] Implement followed only homepage.
- [ ] Display following and followed page.
- [ ] Add real-time updates for notifications.
- [ ] Add upload and display video & gif functionality.
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
