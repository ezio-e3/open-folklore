import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Role } from "@openfolklore/shared";
import { adminApi } from "../api/admin";
import { takedownApi } from "../api/takedown";

// FR16 (role management) + BR8/BR9 (takedown review) — Admin-only.
export function Admin() {
  return (
    <div className="space-y-10">
      <UserManagement />
      <TakedownReview />
    </div>
  );
}

function UserManagement() {
  const queryClient = useQueryClient();
  const usersQuery = useQuery({ queryKey: ["admin", "users"], queryFn: adminApi.listUsers });
  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => adminApi.updateRole(id, { role }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  return (
    <section>
      <h1 className="text-2xl font-bold text-adinkra-900 mb-4">Users & Roles</h1>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left border-b border-adinkra-300">
            <th className="py-2">Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {usersQuery.data?.users.map((u) => (
            <tr key={u.id} className="border-b border-adinkra-100">
              <td className="py-2">{u.name}</td>
              <td>{u.email}</td>
              <td>
                <select
                  value={u.role}
                  onChange={(e) => updateRole.mutate({ id: u.id, role: e.target.value as Role })}
                  className="border border-adinkra-300 rounded-md px-2 py-1"
                >
                  <option value="contributor">Contributor</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function TakedownReview() {
  const queryClient = useQueryClient();
  const requestsQuery = useQuery({ queryKey: ["admin", "takedowns"], queryFn: takedownApi.listOpen });
  const resolve = useMutation({
    mutationFn: ({ id, outcome }: { id: string; outcome: "dismissed" | "upheld" }) =>
      takedownApi.resolve(id, { outcome }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "takedowns"] });
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });

  return (
    <section>
      <h2 className="text-xl font-bold text-adinkra-900 mb-4">Open Takedown Requests</h2>
      {requestsQuery.data?.requests.length === 0 && (
        <p className="text-adinkra-600 text-sm">No open requests.</p>
      )}
      <div className="space-y-3">
        {requestsQuery.data?.requests.map((r) => (
          <div key={r.id} className="border border-adinkra-300 rounded-lg p-3 bg-white text-sm">
            <p>
              <strong>{r.requesterName}</strong> ({r.requesterEmail})
            </p>
            <p className="text-adinkra-700 mt-1">{r.reason}</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => resolve.mutate({ id: r.id, outcome: "dismissed" })}
                className="px-3 py-1 rounded bg-adinkra-200 text-xs"
              >
                Dismiss
              </button>
              <button
                onClick={() => resolve.mutate({ id: r.id, outcome: "upheld" })}
                className="px-3 py-1 rounded bg-red-700 text-white text-xs"
              >
                Uphold (unpublish story)
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
