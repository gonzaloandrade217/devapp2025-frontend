import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from "./routes/AppRoutes";

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <AppRoutes />
      </div>
    </Router>
  );
};

export default App;