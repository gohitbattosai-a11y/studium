import { Routes, Route } from "react-router-dom";
import Studium from "@/pages/Studium";
import { HalloweenBackground } from "@/components/HalloweenBackground";

export default function App() {
  return (
    <>
      {/* Sfondo Canvas Animato Halloween */}
      <HalloweenBackground />

      <Routes>
        <Route path="*" element={<Studium />} />
      </Routes>
    </>
  );
}
