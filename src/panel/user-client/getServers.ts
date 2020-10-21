import {AxiosInstance} from 'axios'
import {rawDataToServerObject, Server} from './server/getServer'
import {PaginatedResult} from './server/types'

interface QueryParams {
    query?: string;
    page?: number;
    onlyAdmin?: boolean;
}

export default (http: AxiosInstance): Promise<PaginatedResult<Server>> => {
  return new Promise((resolve, reject) => {
    http.get('/api/client')
    .then(({data}) => resolve({
      items: (data.data || []).map((datum: any) => rawDataToServerObject(datum)),
      pagination: getPaginationSet(data.meta.pagination),
    }))
    .catch(reject)
  })
}
interface PaginationDataSet {
  total: number;
  count: number;
  perPage: number;
  currentPage: number;
  totalPages: number;
}

export function getPaginationSet(data: any): PaginationDataSet {
  return {
    total: data.total,
    count: data.count,
    perPage: data.per_page,
    currentPage: data.current_page,
    totalPages: data.total_pages,
  }
}
