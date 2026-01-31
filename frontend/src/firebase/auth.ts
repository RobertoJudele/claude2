import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "./config";

/**
 * Register a user with Firebase.
 */
export async function registerUser(email: string, password: string): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

/**
 * Log in a user with Firebase.
 */
export async function loginUser(email: string, password: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

/**
 * Log out user from both Firebase and backend.
 */
export async function logoutUser(): Promise<void> {
  try {
    // 🔹 Log out from Firebase
    await signOut(auth);

    // 🔹 Tell backend to clean up refresh tokens/cookies
    // await fetch("/api/auth/logout", {
    //   method: "POST",
    //   credentials: "include",
    // });

    // 🔹 Remove any stored access tokens (if you use them)
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("accessToken");
  } catch (err) {
    console.error("Logout failed:", err);
  }
}
