export const getApiUrl = () => {
  let API_URL

  if (import.meta.env.PROD) {
    API_URL = "https://notes-app-backend.onrender.com"
  } else {
    API_URL = "http://localhost:3001"
  }

  return API_URL
}
