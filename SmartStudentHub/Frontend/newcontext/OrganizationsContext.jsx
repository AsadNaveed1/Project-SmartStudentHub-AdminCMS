import React, { createContext, useState, useEffect } from "react";
import api from "../src/backend/api";
import { Alert } from "react-native";
export const OrganizationsContext = createContext();
export const OrganizationsProvider = ({ children }) => {
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchOrganizations = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/organizations");
      setOrganizations(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch organizations:", err);
      setError(err.response?.data?.message || err.message);
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to fetch organizations."
      );
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchOrganizations();
  }, []);
  return (
    <OrganizationsContext.Provider
      value={{
        organizations,
        isLoading,
        error,
        fetchOrganizations,
      }}
    >
      {children}
    </OrganizationsContext.Provider>
  );
};