export const getApiUrl = () => {
  let API_URL;

  if (import.meta.env.PROD) {
    API_URL = "https://notesjb.com/api";
  } else {
    API_URL = "http://localhost:3001/api";
  }

  return API_URL;
};
