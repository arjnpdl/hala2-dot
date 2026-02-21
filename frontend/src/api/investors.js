import client from './client'

export const getInvestorThesis = async () => {
  const response = await client.get('/investors/thesis')
  return response.data
}

export const updateInvestorThesis = async (data) => {
  const response = await client.patch('/investors/thesis', data)
  return response.data
}

export const getAllInvestors = async () => {
  const response = await client.get('/investors/all')
  return response.data
}
