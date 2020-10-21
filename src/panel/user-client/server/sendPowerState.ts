
import {AxiosInstance} from 'axios'
export type PowerSignal = 'start' | 'stop' | 'restart' | 'kill'
export default (http: AxiosInstance, uuid: string, signal: PowerSignal): Promise<void> => {
  return new Promise((resolve, reject) => {
    http.post(`/api/client/servers/${uuid}/power`, {signal})
    .then(() => resolve())
    .catch(reject)
  })
}
