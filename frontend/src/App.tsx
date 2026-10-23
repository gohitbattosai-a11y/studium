import { Routes, Route } from "react-router-dom";
import Studium from "@/pages/Studium";
import { HalloweenBackground } from "@/components/HalloweenBackground";

export default function App() {
  return (
    <>
      {/* Componente di Halloween visibile sopra tutte le pagine/tab */}
      <HalloweenBackground />

      <Routes>
        <Route path="*" element={<Studium />} />
      </Routes>
    </>
  );
}
