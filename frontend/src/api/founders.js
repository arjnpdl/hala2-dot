import client from './client'

export const getStartupProfile = async () => {
  const response = await client.get('/founders/profile')
  return response.data
}

export const updateStartupProfile = async (data) => {
  const response = await client.patch('/founders/profile', data)
  return response.data
}

export const getMyJobs = async () => {
  const response = await client.get('/founders/jobs')
  return response.data
}

export const createJob = async (jobData) => {
  const response = await client.post('/founders/jobs', jobData)
  return response.data
}

export const updateJob = async ({ jobId, ...jobData }) => {
  const response = await client.put(`/founders/jobs/${jobId}`, jobData)
  return response.data
}

export const deleteJob = async (jobId) => {
  const response = await client.delete(`/founders/jobs/${jobId}`)
  return response.data
}
