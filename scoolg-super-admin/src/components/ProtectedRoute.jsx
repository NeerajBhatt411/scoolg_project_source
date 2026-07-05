import { Navigate } from 'react-router-dom';
import { getToken } from '../lib/api';

// Gate every super-admin page behind a valid session token.
const ProtectedRoute = ({ children }) => (getToken() ? children : <Navigate to="/login" replace />);

export default ProtectedRoute;
