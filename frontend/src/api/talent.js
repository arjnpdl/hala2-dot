import client from './client'

export const getTalentProfile = async () => {
  const response = await client.get('/talent/profile')
  return response.data
}

export const updateTalentProfile = async (data) => {
  const response = await client.patch('/talent/profile', data)
  return response.data
}
