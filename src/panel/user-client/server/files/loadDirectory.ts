
import {AxiosInstance} from 'axios'
import {rawDataToFileObject} from '../../transformers'
export interface FileObject {
    key: string;
    name: string;
    mode: string;
    size: number;
    isFile: boolean;
    isSymlink: boolean;
    mimetype: string;
    createdAt: Date;
    modifiedAt: Date;
    isArchiveType: () => boolean;
    isEditable: () => boolean;
}

export default async (http: AxiosInstance, uuid: string, directory?: string): Promise<FileObject[]> => {
  const {data} = await http.get(`/api/client/servers/${uuid}/files/list`, {
    params: {directory},
  })

  return (data.data || []).map(rawDataToFileObject)
}
