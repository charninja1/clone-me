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
import { Layout, Card, Button, Input, AlertBanner } from "../components";
import { db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

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
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <Card>
          <h1 className="text-2xl font-bold text-center mb-6 text-primary-700">
            {user ? `Logged in as ${user.email}` : "Log in or Sign up"}
          </h1>

          {error && (
            <AlertBanner 
              type="error" 
              message={error} 
              className="mb-4" 
              onClose={() => setError("")}
            />
          )}

          {!user ? (
            <form className="space-y-6">
              <Input
                id="email"
                name="email"
                type="email"
                label="Email address"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  onClick={handleLogin}
                  disabled={isLoading}
                  isLoading={isLoading}
                >
                  Sign in
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleSignup}
                  disabled={isLoading}
                >
                  Create account
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <p className="mb-4 text-surface-600">You are currently signed in.</p>
              <Button
                onClick={handleLogout}
                variant="primary"
              >
                Sign out
              </Button>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}