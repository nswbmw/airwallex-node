export type Environment = 'sandbox' | 'production'

export type AirwallexProxyOptions =
  | string
  | {
      protocol: 'http' | 'socks'
      host: string
      port: number
      username?: string
      password?: string
    }

export interface AirwallexOptions {
  clientId: string
  clientSecret: string
  environment?: Environment
  proxy?: AirwallexProxyOptions
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD'

export interface ExecuteOptions {
  method?: HttpMethod
  url: string
  headers?: Record<string, string | number | boolean>
  body?: any
}

export default class Airwallex {
  constructor (options?: AirwallexOptions)
  execute<T = any> (options: ExecuteOptions): Promise<T>
}
