import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import firebaseConfig from "./config";

const hasConfig = Boolean(
  firebaseConfig &&
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);

let db;
let auth;
let provider;
let storage;

if (hasConfig) {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  db = firebase.firestore();
  auth = firebase.auth();
  provider = new firebase.auth.GoogleAuthProvider();
  storage = firebase.storage();
} else {
  // Graceful no-Firebase mode so the app can render without crashing
  // Articles will not load and sign-in will be disabled until env vars are set
  // See App logs for details
  // eslint-disable-next-line no-console
  console.warn("Firebase environment variables are missing. UI will run in read-only demo mode.");

  db = {
    collection() {
      return {
        add: async () => {},
        orderBy() {
          return { onSnapshot: () => {} };
        },
        doc() {
          return { update: async () => {} };
        },
      };
    },
  };

  auth = {
    onAuthStateChanged(cb) {
      if (typeof cb === "function") cb(null);
    },
    signInWithPopup: async () => {
      throw new Error("Firebase not configured. Please set REACT_APP_FIREBASE_* env vars in project settings.");
    },
    signOut: async () => {},
  };

  provider = {};

  storage = {
    ref() {
      return {
        put() {
          return {
            on(_evt, _progress, onError) {
              if (typeof onError === "function") {
                onError(new Error("Firebase not configured. Uploads disabled."));
              }
            },
            snapshot: { ref: { getDownloadURL: async () => "" } },
          };
        },
      };
    },
  };
}

export { auth, provider, storage };
export default db;
