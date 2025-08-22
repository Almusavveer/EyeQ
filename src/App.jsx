import HomePage from "./Pages/HomePage";
import AppRoutes from "./Routes/AppRoutes";

const App = () => {
  // bg-gradient-to-br from-[#e7ebf0] via-[#f7fafc] to-[#dde5ed]
  return (
    <div className="h-screen p-5">
      {/* <HomePage /> */}
      <AppRoutes />
    </div>
  );
};

export default App;
