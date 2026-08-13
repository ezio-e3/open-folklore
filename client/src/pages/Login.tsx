import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth";
import { AUTH_QUERY_KEY } from "../hooks/useAuth";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => authApi.login({ email, password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      navigate("/");
    },
  });

  return (
    <div className="max-w-sm mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-adinkra-900 mb-4">Log in</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="space-y-3"
      >
        <input
          required
          type="email"
          placeholder="Email"
          className="w-full border border-adinkra-300 rounded-md px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          required
          type="password"
          placeholder="Password"
          className="w-full border border-adinkra-300 rounded-md px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {mutation.isError && <p className="text-sm text-red-700">{mutation.error.message}</p>}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full py-2 rounded-md bg-adinkra-700 text-white font-medium"
        >
          {mutation.isPending ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="text-sm text-adinkra-600 mt-4">
        No account? <Link to="/register" className="underline">Register</Link>
      </p>
    </div>
  );
}
