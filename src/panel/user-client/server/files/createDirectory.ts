
import {AxiosInstance} from 'axios'

export default (http: AxiosInstance, uuid: string, root: string, name: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    http.post(`/api/client/servers/${uuid}/files/create-folder`, {root, name})
    .then(() => resolve())
    .catch(reject)
  })
}
