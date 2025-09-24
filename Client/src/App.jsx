import HomePage from "./Pages/HomePage";
import AppRoutes from "./Routes/AppRoutes";
import { AuthProvider } from "./Context/AuthContext";

const App = () => {
  // bg-gradient-to-br from-[#e7ebf0] via-[#f7fafc] to-[#dde5ed]
  return (
    <AuthProvider>
      <div className="h-screen p-5 bg-gray-50">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
};

export default App;
