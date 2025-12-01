export type Environment = 'sandbox' | 'production'

export interface AirwallexWorkerOptions {
  clientId: string
  clientSecret: string
  environment?: Environment
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD'

export interface ExecuteOptions {
  method?: HttpMethod
  url: string
  headers?: Record<string, string | number | boolean>
  body?: any
}

export default class Airwallex {
  constructor (options?: AirwallexWorkerOptions)
  execute<T = any> (options: ExecuteOptions): Promise<T>
}
