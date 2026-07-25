import { Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<div className="p-8"><h1 className="text-2xl font-bold">JobTrack</h1><p className="text-muted-foreground">Welcome to JobTrack</p></div>} />
      <Route path="/login" element={<div>Login</div>} />
      <Route path="/register" element={<div>Register</div>} />
      <Route path="/dashboard" element={<div>Dashboard</div>} />
      <Route path="/companies" element={<div>Companies</div>} />
      <Route path="/jobs" element={<div>Jobs</div>} />
      <Route path="/applications" element={<div>Applications</div>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
