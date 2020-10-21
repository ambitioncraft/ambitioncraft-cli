
import {AxiosInstance} from 'axios'
import {rawDataToServerAllocation, rawDataToServerEggVariable} from '../transformers'
import {FractalResponseData, FractalResponseList, ServerEggVariable} from '../server/types'
export interface Allocation {
    id: number;
    ip: string;
    alias: string | null;
    port: number;
    notes: string | null;
    isDefault: boolean;
}

export interface Server {
    id: string;
    uuid: string;
    name: string;
    node: string;
    sftpDetails: {
        ip: string;
        port: number;
    };
    invocation: string;
    description: string;
    limits: {
        memory: number;
        swap: number;
        disk: number;
        io: number;
        cpu: number;
        threads: string;
    };
    featureLimits: {
        databases: number;
        allocations: number;
        backups: number;
    };
    isSuspended: boolean;
    isInstalling: boolean;
    variables: ServerEggVariable[];
    allocations: Allocation[];
}

export const rawDataToServerObject = ({attributes: data}: FractalResponseData): Server => ({
  id: data.identifier,
  uuid: data.uuid,
  name: data.name,
  node: data.node,
  invocation: data.invocation,
  sftpDetails: {
    ip: data.sftp_details.ip,
    port: data.sftp_details.port,
  },
  description: data.description ? ((data.description.length > 0) ? data.description : null) : null,
  limits: {...data.limits},
  featureLimits: {...data.feature_limits},
  isSuspended: data.is_suspended,
  isInstalling: data.is_installing,
  variables: ((data.relationships?.variables as FractalResponseList | undefined)?.data || []).map(rawDataToServerEggVariable),
  allocations: ((data.relationships?.allocations as FractalResponseList | undefined)?.data || []).map(rawDataToServerAllocation),
})

export default (http: AxiosInstance, uuid: string): Promise<[ Server, string[] ]> => {
  return new Promise((resolve, reject) => {
    http.get(`/api/client/servers/${uuid}`)
    .then(({data}) => resolve([
      rawDataToServerObject(data),
                // eslint-disable-next-line camelcase
                data.meta?.is_server_owner ? ['*'] : (data.meta?.user_permissions || []),
    ]))
    .catch(reject)
  })
}
