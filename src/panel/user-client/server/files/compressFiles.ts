
import {FileObject} from './loadDirectory'
import {AxiosInstance} from 'axios'
import {rawDataToFileObject} from '../../transformers'
export default async (http: AxiosInstance, uuid: string, directory: string, files: string[]): Promise<FileObject> => {
  const {data} = await http.post(`/api/client/servers/${uuid}/files/compress`, {root: directory, files}, {
    timeout: 60000,
    timeoutErrorMessage: 'It looks like this archive is taking a long time to generate. It will appear once completed.',
  })

  return rawDataToFileObject(data)
}
