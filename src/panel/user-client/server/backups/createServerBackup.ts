import {rawDataToServerBackup} from '../../transformers'
import {ServerBackup} from '../types'
import {AxiosInstance} from 'axios'
export default (http: AxiosInstance, uuid: string, name?: string, ignored?: string): Promise<ServerBackup> => {
  return new Promise((resolve, reject) => {
    http.post(`/api/client/servers/${uuid}/backups`, {
      name, ignored,
    })
    .then(({data}) => resolve(rawDataToServerBackup(data)))
    .catch(reject)
  })
}
