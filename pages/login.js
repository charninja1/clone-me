// pages/login.js
import { useState, useEffect } from "react";
import { auth } from "../lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  };

  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;

      await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      createdAt: new Date().toISOString(),
      settings: {
        darkMode: false,
        autoSave: false,
      },
      defaultVoiceId: null
    });

      router.push("/");
    } catch (err) {
      alert("Signup failed: " + err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <Layout>
      <h2>{user ? `Logged in as ${user.email}` : "Log in or Sign up"}</h2>

      {!user && (
        <>
          <input
            type="email"
            placeholder="Email"
            value={email}
            style={{ display: "block", marginBottom: "1rem", width: "100%" }}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            style={{ display: "block", marginBottom: "1rem", width: "100%" }}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin} style={{ marginRight: "1rem" }}>Login</button>
          <button onClick={handleSignup}>Sign up</button>
        </>
      )}

      {user && (
        <button onClick={handleLogout} style={{ marginTop: "1rem" }}>
          Log out
        </button>
      )}
    </Layout>
  );
}
