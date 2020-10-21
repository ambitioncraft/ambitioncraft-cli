
import {AxiosInstance} from 'axios'
export default (http: AxiosInstance, uuid: string, backup: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    http.delete(`/api/client/servers/${uuid}/backups/${backup}`)
    .then(() => resolve())
    .catch(reject)
  })
}
