import { auth } from "../firebase/config";

/**
 * apiFetch - Secure wrapper for fetch() with Firebase ID token support.
 *
 * Automatically attaches Firebase ID token (JWT) in Authorization header.
 * Auto-refreshes expired tokens.
 * Handles unauthorized responses (401/403) by logging out.
 * Returns parsed JSON automatically, or throws detailed error.
 */
// export async function apiFetch<T = any>(
//   url: string,
//   options: RequestInit = {}
// ): Promise<T> {
//   const user = auth.currentUser;

//   if (!user) {
//     throw new Error("User not authenticated");
//   }

//   // Get a fresh ID token (forces refresh if expired)
//   const idToken = await user.getIdToken(true);

//   // Merge headers safely
//   const headers = new Headers(options.headers || {});
//   if (!headers.has("Authorization")) headers.set("Authorization", `Bearer ${idToken}`);
//   if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

//   const response = await fetch(url, {
//     ...options,
//     headers
//   });

//   // Handle unauthorized responses globally
//   if (response.status === 401 || response.status === 403) {
//     console.warn("Token expired or unauthorized — logging out...");
//     await auth.signOut();
//     window.location.href = "/login";
//     throw new Error("Unauthorized or expired token !!ERROR HERE!!");
//   }

//   // Try to parse JSON; fallback to text
//   try {
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.detail || JSON.stringify(data));
//     return data;
//   } catch (err) {
//     // Handle non-JSON responses gracefully
//     if (!response.ok) {
//       const text = await response.text();
//       throw new Error(text || response.statusText);
//     }
//     throw err;
//   }
// }

function waitForFirebaseUser(): Promise<typeof auth.currentUser> {
  return new Promise((resolve) => {
    if (auth.currentUser) {
      resolve(auth.currentUser);
    } else {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
      });
    } 
  });
}

export async function apiFetch<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const user = await waitForFirebaseUser();
  if (!user) throw new Error("User not authenticated");

  const idToken = await user.getIdToken(true);

  const headers = new Headers(options.headers || {});
  if (!headers.has("Authorization")) headers.set("Authorization", `Bearer ${idToken}`);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  console.log("REQ", url, "auth?", headers.get("Authorization")?.slice(0, 20));

  const response = await fetch(url, { ...options, headers });

  const raw = await response.text(); // read ONCE
  let data: any = null;
  try { data = raw ? JSON.parse(raw) : null; } catch {}

  if (response.status === 401 || response.status === 403) {
    await auth.signOut();
    window.location.href = "/login";
    throw new Error((data && (data.detail || data.message)) || "Unauthorized");
  }

  if (!response.ok) {
    throw new Error((data && (data.detail || data.message)) || raw || response.statusText);
  }

  return (data ?? raw) as T;
}


export async function apiFetchBlob(
  url: string,
  options: RequestInit = {}
): Promise<Blob> {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const idToken = await user.getIdToken(true);

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${idToken}`);

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    await auth.signOut();
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || res.statusText);
  }

  return await res.blob();
}