import {
  useState,
  type FormEvent,
} from "react";

import { Link } from "react-router-dom";

import Button from "../../../components/Button";
import Input from "../../../components/Input";

import {
  apiRequest,
  ApiError,
} from "../../../api/apiClient";

type LoginResponse = {
  accessToken: string;

  user: {
    id: string;
    email: string;
    username: string;
  };
};

type LoginPageProps = {
  onCreateAccount: () => void;

  onLoginSuccess?: (
    data: LoginResponse
  ) => void;
};

function LoginPage({
  onCreateAccount,
  onLoginSuccess,
}: LoginPageProps) {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    const cleanEmail =
      email.trim();

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(
        cleanEmail
      )
    ) {
      setError(
        "Please enter a valid email address."
      );

      return;
    }

    if (
      password.trim() === ""
    ) {
      setError(
        "Please enter your password."
      );

      return;
    }

    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const data =
        await apiRequest<LoginResponse>(
          "/auth/login",
          {
            method: "POST",

            body: JSON.stringify({
              email: cleanEmail,
              password,
            }),
          }
        );

      setMessage(
        "Login successful!"
      );

      onLoginSuccess?.(data);
    } catch (err) {
      if (
        err instanceof ApiError &&
        err.status === 401
      ) {
        setError(
          "Invalid email or password."
        );
      } else if (
        err instanceof ApiError
      ) {
        setError(
          err.message
        );
      } else {
        setError(
          "Cannot connect to the server."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="brand-side">
        <p className="small-label">
          BUILT FOR YOUR 42 JOURNEY
        </p>

        <h1>PXL_LAB</h1>

        <h2>
          Big ideas.
          <br />
          Small pixels.
        </h2>

        <p>
          Your campus, connected.
        </p>
      </section>

      <section className="login-card">
        <p className="small-label">
          SIGN IN
        </p>

        <h2>
          Welcome back.
        </h2>

        <p>
          Pick up where your
          curiosity left off.
        </p>

        <form
          onSubmit={handleSubmit}
          noValidate
        >
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
          />

          <Button
            text={
              isLoading
                ? "Logging in..."
                : "Log in"
            }
          />
        </form>

        {error && (
          <p
            className="form-error"
            role="alert"
          >
            {error}
          </p>
        )}

        {message && (
          <p
            className="message"
            role="status"
          >
            {message}
          </p>
        )}

        <button
          type="button"
          className="text-link"
          onClick={
            onCreateAccount
          }
        >
          New around here?
          Create an account
        </button>

        <div className="auth-legal-links">
          <Link to="/privacy">
            Privacy policy
          </Link>

          <Link to="/terms">
            Terms of service
          </Link>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;