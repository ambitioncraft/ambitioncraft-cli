
import {AxiosInstance} from 'axios'
export default (http: AxiosInstance, uuid: string, command: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    http.post(`/api/client/servers/${uuid}/command`, {command})
    .then(() => resolve())
    .catch(reject)
  })
}
