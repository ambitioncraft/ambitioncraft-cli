
import {AxiosInstance} from 'axios'
export default (http: AxiosInstance, uuid: string, file: string, content: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    http.post(
      `/api/client/servers/${uuid}/files/write`,
      content,
      {
        params: {file},
        headers: {
          'Content-Type': 'text/plain',
        },
      },
    )
    .then(() => resolve())
    .catch(reject)
  })
}
