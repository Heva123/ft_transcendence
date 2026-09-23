import { useState, type FormEvent } from "react";

import Button from "../components/Button";
import Input from "../components/Input";

type RegisterPageProps = {
  onSignIn: () => void;
};

function RegisterPage({ onSignIn }: RegisterPageProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading || isRegistered) {
      return;
    }

    setError("");
    setMessage("");

    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    // Backend requires 3-30 characters:
    // letters, numbers, and underscores only.
    const usernamePattern = /^[a-zA-Z0-9_]{3,30}$/;

    if (!usernamePattern.test(cleanUsername)) {
      setError(
        "Username must be 3-30 characters and contain only letters, numbers, or underscores."
      );
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Backend requires 8-72 characters,
    // including uppercase, lowercase, and a number.
    if (password.length < 8 || password.length > 72) {
      setError("Password must contain 8-72 characters.");
      return;
    }

    if (
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      setError(
        "Password must include an uppercase letter, a lowercase letter, and a number."
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: cleanUsername,
            email: cleanEmail,
            password: password,
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 409) {
          setError(
            "This email or username is already registered. Try another one or sign in."
          );
        } else if (response.status === 400) {
          setError(
            "Please check your username, email, and password."
          );
        } else {
          setError(
            "Registration failed. Please try again."
          );
        }

        return;
      }

      // Registration succeeded.
      // We do not store or display the returned access token here.
      setPassword("");
      setIsRegistered(true);
      setMessage(
        "Account created successfully! You can now sign in."
      );
    } catch {
      setError(
        "Cannot connect to the server. Please check that the backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="brand-side">
        <p className="small-label">BUILT FOR YOUR 42 JOURNEY</p>

        <h1>PXL_LAB</h1>

        <h2>
          Big ideas.
          <br />
          Small pixels.
        </h2>

        <p>Your campus, connected.</p>
      </section>

      <section className="login-card">
        <p className="small-label">CREATE ACCOUNT</p>

        <h2>Find your people.</h2>

        <p>A new place to learn, share and belong.</p>

        {!isRegistered && (
          <form onSubmit={handleSubmit} noValidate>
            <Input
              id="username"
              label="Username"
              type="text"
              placeholder="maram_42"
              value={username}
              onChange={setUsername}
              required
            />

            <Input
              id="email"
              label="Email address"
              type="email"
              placeholder="maram@example.com"
              value={email}
              onChange={setEmail}
              required
            />

            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={setPassword}
              required
              minLength={8}
            />

            <p className="password-hint">
              Use 8-72 characters, including uppercase,
              lowercase, and a number.
            </p>

            <p className="legal-text">
              Before creating an account, review the{" "}
              <a href="#/terms">
                Terms of Service (draft)
              </a>
              {" "}and{" "}
              <a href="#/privacy">
                Privacy Policy (draft)
              </a>.
            </p>

            <Button
              text={
                isLoading
                  ? "Creating account..."
                  : "Create account"
              }
            />
          </form>
        )}

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        {message && (
          <p className="message" role="status">
            {message}
          </p>
        )}

        <button
          type="button"
          className="text-link"
          onClick={onSignIn}
        >
          {isRegistered
            ? "Continue to sign in"
            : "Already here? Sign in"}
        </button>
      </section>
    </main>
  );
}

export default RegisterPage;