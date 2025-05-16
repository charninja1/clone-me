// pages/login.js
import { useState, useEffect } from "react";
import { auth } from "../lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "firebase/auth";
import { useRouter } from "next/router";
import { Layout, Card, Button, Input, AlertBanner } from "../components";
import { db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
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
  
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    setResetSuccess(false);
    
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    
    setResetLoading(true);
    
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSuccess(true);
      // Keep the success message visible for a while, then return to login
      setTimeout(() => {
        setForgotPassword(false);
        setResetSuccess(false);
      }, 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate required fields for signup
    if (!firstName.trim()) {
      setError("First name is required for account creation");
      return;
    }
    
    if (!lastName.trim()) {
      setError("Last name is required for account creation");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        firstName,
        lastName,
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
            forgotPassword ? (
              <form className="space-y-6">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-medium text-surface-800 dark:text-surface-200">Reset Your Password</h2>
                  <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>
                
                {resetSuccess && (
                  <AlertBanner
                    type="success"
                    message="Password reset email sent! Check your inbox for instructions."
                    className="mb-4"
                  />
                )}
                
                <Input
                  id="reset-email"
                  name="email"
                  type="email"
                  label="Email address"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                
                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    onClick={handlePasswordReset}
                    disabled={resetLoading}
                    isLoading={resetLoading}
                  >
                    Send Reset Link
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setForgotPassword(false)}
                    disabled={resetLoading}
                  >
                    Back to Login
                  </Button>
                </div>
              </form>
            ) : (
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
                  helpText="Click the eye icon to show/hide password"
                />
                
                <div className="flex justify-end">
                  <button 
                    type="button" 
                    onClick={() => setForgotPassword(true)}
                    className="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Forgot password?
                  </button>
                </div>
                
                <div className="border-t border-surface-200 dark:border-surface-700 pt-4 mt-4">
                  <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">
                    Additional information required for account creation:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      label="First Name"
                      autoComplete="given-name"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                    
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      label="Last Name"
                      autoComplete="family-name"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

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
            )
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