import { Routes, Route } from "react-router-dom";
import Studium from "@/pages/Studium";

export default function App() {
  return (
    <Routes>
      <Route path="*" element={<Studium />} />
    </Routes>
  );
}
