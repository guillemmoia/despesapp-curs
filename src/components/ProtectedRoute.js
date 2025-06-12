import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import PropTypes from 'prop-types';

export default function ProtectedRoute({ children }) {
    const { currentUser } = useAuth();
    return currentUser ? children : <Navigate to="/login" replace />;
}

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
};