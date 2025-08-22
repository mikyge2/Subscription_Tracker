import { createHandler } from './_lib/middleware.js';

const rootHandler = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Subscription Tracker API - Serverless Edition",
    version: "2.0.0",
    endpoints: {
      auth: {
        signUp: "/api/auth/sign-up",
        signIn: "/api/auth/sign-in",
        signOut: "/api/auth/sign-out/[id]"
      },
      users: {
        getAll: "/api/users",
        getUser: "/api/users/[id]",
        updateUser: "/api/users/[id]",
        deleteUser: "/api/users/[id]"
      },
      subscriptions: {
        getAll: "/api/subscriptions",
        create: "/api/subscriptions",
        getSubscription: "/api/subscriptions/[id]",
        update: "/api/subscriptions/[id]",
        delete: "/api/subscriptions/[id]",
        getUserSubscriptions: "/api/subscriptions/user/[id]",
        cancelSubscription: "/api/subscriptions/cancel/[id]",
        upcomingRenewals: "/api/subscriptions/upcoming-user-renewals/[id]"
      },
      workflows: {
        subscriptionReminder: "/api/workflows/subscription/reminder"
      }
    }
  });
};

export default createHandler(rootHandler);