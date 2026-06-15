const BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function apiClient(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || `${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const getData = (endpoint) => apiClient(endpoint);
export const postData = (endpoint, data) =>
  apiClient(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
export const putData = (endpoint, data) =>
  apiClient(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const patchData = (endpoint, data) =>
  apiClient(endpoint, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
export const deleteData = (endpoint, data) =>
  apiClient(endpoint, {
    method: "DELETE",
    body: JSON.stringify(data),
  });
