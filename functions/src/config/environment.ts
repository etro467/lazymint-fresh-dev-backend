interface EnvironmentConfig {
  projectId: string;
  apiKey: string;
  authDomain: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const configs: Record<string, EnvironmentConfig> = {
  development: {
    projectId: "lazymint-fresh-dev",
    apiKey: "YOUR_DEV_API_KEY",
    authDomain: "lazymint-fresh-dev.firebaseapp.com",
    storageBucket: "lazymint-fresh-dev.appspot.com",
    messagingSenderId: "YOUR_DEV_MESSAGING_SENDER_ID",
    appId: "YOUR_DEV_APP_ID",
  },
  production: {
    projectId: "lazymint-fresh",
    apiKey: "YOUR_PROD_API_KEY",
    authDomain: "lazymint-fresh.firebaseapp.com",
    storageBucket: "lazymint-fresh.appspot.com",
    messagingSenderId: "YOUR_PROD_MESSAGING_SENDER_ID",
    appId: "YOUR_PROD_APP_ID",
  },
};

export const getEnvironmentConfig = (): EnvironmentConfig => {
  const env = process.env.NODE_ENV || "development";
  return configs[env];
};
