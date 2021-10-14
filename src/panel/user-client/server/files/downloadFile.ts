import Axios, {AxiosInstance} from 'axios'
import getFileDownloadUrl from './getFileDownloadUrl'
import https from 'https'
export default async (axios: AxiosInstance, server: string, path: string): Promise<Buffer> => {
  const url = await getFileDownloadUrl(axios, server, path)

  return new Promise((resolve, reject) => {
    https.get(url, function (res) {
      const data: any[] = []
      res.on('data', function (chunk) {
        data.push(chunk)
      }).on('end', function () {
        const buffer = Buffer.concat(data)
        resolve(buffer)
      })
      .on('error', function (error) {
        reject(error)
      })
    })
  })
}
