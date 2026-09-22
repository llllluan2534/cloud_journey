import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import Home from "./pages/Home";
import Timeline from "./pages/Timeline";
import Letter from "./pages/Letter";
import Gallery from "./pages/Gallery";
import BucketList from "./pages/BucketList";
import Dashboard from "./pages/Dashboard";

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/letter" element={<Letter />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/bucket-list" element={<BucketList />} />
        </Routes>
      </App>
    </BrowserRouter>
  </StrictMode>
);
