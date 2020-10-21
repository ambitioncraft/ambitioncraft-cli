
import {AxiosInstance} from 'axios'

export default (http: AxiosInstance, server: string, file: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    http.get(`/api/client/servers/${server}/files/contents`, {
      params: {file},
      transformResponse: res => res,
      responseType: 'text',
    })
    .then(({data}) => resolve(data))
    .catch(reject)
  })
}
