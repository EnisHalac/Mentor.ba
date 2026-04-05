import apiClient from "./apiClient";

export const getMyEnrollments = async () => {
  const response = await apiClient.get("/enrollments/my-learning");
  return response.data;
};

export const getAuthorStats = async () => {
  const response = await apiClient.get("/enrollments/author-stats");
  return response.data;
};

export const toggleEnrollment = async (listingId) => {
  const response = await apiClient.post(`/enrollments/toggle/${listingId}`);
  return response.data;
};

export const getListingEnrollments = async (listingId) => {
  const response = await apiClient.get(`/enrollments/listing/${listingId}`);
  return response.data;
};

export const approveEnrollment = async (listingId, studentId) => {
  const response = await apiClient.patch(`/enrollments/approve/${listingId}/${studentId}`);
  return response.data;
};