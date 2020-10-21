
import {AxiosInstance} from 'axios'
export default (http: AxiosInstance, uuid: string, backup: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    http.get(`/api/client/servers/${uuid}/backups/${backup}/download`)
    .then(({data}) => resolve(data.attributes.url))
    .catch(reject)
  })
}
