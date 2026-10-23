import { Routes, Route } from "react-router-dom";
import Studium from "@/pages/Studium";

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
// Tabs inside Studium switch via component state only — no route changes.
export default function App() {
  return (
    <Routes>
      <Route path="*" element={<Studium />} />
    </Routes>
  );
}
