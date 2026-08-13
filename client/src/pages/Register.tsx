import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth";
import { AUTH_QUERY_KEY } from "../hooks/useAuth";

export function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => authApi.register(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      navigate("/");
    },
  });

  return (
    <div className="max-w-sm mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-adinkra-900 mb-4">Create an account</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="space-y-3"
      >
        <input
          required
          placeholder="Name"
          className="w-full border border-adinkra-300 rounded-md px-3 py-2"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <input
          required
          type="email"
          placeholder="Email"
          className="w-full border border-adinkra-300 rounded-md px-3 py-2"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
        <input
          required
          type="password"
          placeholder="Password (min. 8 characters, 1 digit)"
          className="w-full border border-adinkra-300 rounded-md px-3 py-2"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        />
        {mutation.isError && <p className="text-sm text-red-700">{mutation.error.message}</p>}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full py-2 rounded-md bg-adinkra-700 text-white font-medium"
        >
          {mutation.isPending ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="text-sm text-adinkra-600 mt-4">
        Already have an account? <Link to="/login" className="underline">Log in</Link>
      </p>
    </div>
  );
}
