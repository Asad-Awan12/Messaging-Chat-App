import axios from "axios";

const getAuthHeaders = () => {
  let getToken = JSON.parse(localStorage.getItem("admin"));
  if (!getToken) getToken = JSON.parse(sessionStorage.getItem("admin"));

  const token = getToken ? getToken.accessToken : null;

  return {
    Authorization: token,
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  };
};

export const postApi = async ({ url, credentials = {} }) => {
  const response = await axios.post(url, credentials, {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const getByIdApi = async ({ url, credentials }) => {
  try {
    const response = await axios.get(`${url}/${credentials}`, {
      headers: getAuthHeaders()
    });
    console.log("reeees from id ",response?.data);
    
        return response.data;
  } catch (error) {
    console.log("error ",error);
    
    throw error;
  }
};

export const getApi = async ({ url }) => {
  const response = await axios.get(
    url,
    {
      headers: getAuthHeaders(),
    },
    url
  );

  if (response.status === 200) return response.data;
};
