import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { logoutUser } from "../auth/authSlice";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger logout thunk
    dispatch(logoutUser()).then(() => {
      // Redirect to login after a short delay
      setTimeout(() => navigate("/"), 800);
    });
  }, [dispatch, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold text-indigo-700 mb-3">
          Logging Out...
        </h2>
        <p className="text-gray-600 text-sm mb-4">
          Please wait while we securely log you out.
        </p>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce delay-150"></div>
          <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce delay-300"></div>
        </div>
      </div>
    </div>
  );
}
