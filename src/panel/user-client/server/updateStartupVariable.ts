import {AxiosInstance} from 'axios'
import {rawDataToServerEggVariable} from '../transformers'
import {ServerEggVariable} from './types'

export default async (http: AxiosInstance, uuid: string, key: string, value: string): Promise<[ ServerEggVariable, string ]> => {
  const {data} = await http.put(`/api/client/servers/${uuid}/startup/variable`, {key, value})

  return [rawDataToServerEggVariable(data), data.meta.startup_command]
}
