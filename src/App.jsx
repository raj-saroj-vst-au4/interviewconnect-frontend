import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./views/Login";
import Layout from "./views/Layout";
import MeetingPage from "./views/MeetingPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<MeetingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
