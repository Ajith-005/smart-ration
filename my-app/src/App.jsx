import { Routes, Route } from "react-router-dom";
import Header from "./Components/Header";

import Home from "./Components/Home";
import About from "./Components/About";
import Services from "./Components/Services";
import Contact from "./Components/Contact";
import Admin from "./Components/Admin";

function App() {
  return (
    <>
      <Header />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
