import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { RequireRole } from "./components/RequireRole";
import { Browse } from "./pages/Browse";
import { StoryDetail } from "./pages/StoryDetail";
import { Submit } from "./pages/Submit";
import { MySubmissions } from "./pages/MySubmissions";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ModerationQueue } from "./pages/ModerationQueue";
import { Admin } from "./pages/Admin";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Browse />} />
          <Route path="stories/:id" element={<StoryDetail />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route
            path="submit"
            element={
              <RequireRole roles={["contributor", "moderator", "admin"]}>
                <Submit />
              </RequireRole>
            }
          />
          <Route
            path="my-submissions"
            element={
              <RequireRole roles={["contributor", "moderator", "admin"]}>
                <MySubmissions />
              </RequireRole>
            }
          />
          <Route
            path="moderation"
            element={
              <RequireRole roles={["moderator", "admin"]}>
                <ModerationQueue />
              </RequireRole>
            }
          />
          <Route
            path="admin"
            element={
              <RequireRole roles={["admin"]}>
                <Admin />
              </RequireRole>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
