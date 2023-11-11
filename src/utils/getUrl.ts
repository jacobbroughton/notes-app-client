export const getApiUrl = () => {
  let API_URL

  if (import.meta.env.PROD) {
    API_URL = "https://notes-app-jb-8363f34d89d9.herokuapp.com/api"
  } else {
    API_URL = "http://localhost:3001/api"
  }

  return API_URL
}
