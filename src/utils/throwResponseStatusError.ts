export function throwResponseStatusError(response: Response, method: string) {
  const parsedUrl = response.url.replace('http://localhost:3001', '')
  throw `There was an error - ${parsedUrl} - Status ${response.status} - Method ${response}`
}