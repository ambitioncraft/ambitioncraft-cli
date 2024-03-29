
import axios, {AxiosInstance, AxiosError} from 'axios'

export default class PanelUserClient {
  http: AxiosInstance

  private constructor(axiosInstance: AxiosInstance) {
    this.http = axiosInstance
  }

  static async create(host: string, key: string): Promise<PanelUserClient> {
    host = host.trim()
    if (host.endsWith('/')) {
      host = host.slice(0, -1)
    }
    const api = axios.create({
      baseURL: host,
      headers: {
        Authorization: 'Bearer ' + key,
        'Content-Type': 'application/json',
        Accept: 'Application/vnd.pterodactyl.v1+json',
      },
    })

    const response = await api.get('/api/client')
    if (response.status === 404) {
      throw new Error('API Key is not valid! (User)')
    }
    return new PanelUserClient(api)
  }
}

