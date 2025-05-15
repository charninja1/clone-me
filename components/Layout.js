import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Link from "next/link";

export default function Layout({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  return (
    <div>
      <nav style={{
        padding: "1rem",
        backgroundColor: "#f5f5f5",
        borderBottom: "1px solid #ccc",
        marginBottom: "2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <Link href="/" style={{ marginRight: "1rem" }}>🏠 Generator</Link>
          <Link href="/tones" style={{ marginRight: "1rem" }}>🎨 Tones</Link>
          <Link href="/settings">⚙️ Settings</Link>
        </div>

        <div>
          {!user && <Link href="/login">🔐 Login</Link>}
          {user && (
            <>
              <span style={{ marginRight: "1rem" }}>👤 {user.email}</span>
              <button onClick={() => signOut(auth)}>Logout</button>
            </>
          )}
        </div>
      </nav>
      <main style={{ padding: "0 2rem" }}>{children}</main>
    </div>
  );
}
