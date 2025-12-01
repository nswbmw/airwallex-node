import MemoryCache from 'memory-cache'
import request from 'lite-request'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { SocksProxyAgent } from 'socks-proxy-agent'

const cache = new MemoryCache.Cache()

class Airwallex {
  constructor (options = {}) {
    this.clientId = options.clientId || options.client_id
    this.clientSecret = options.clientSecret || options.client_secret
    this.environment = options.environment || 'sandbox'

    if (!this.clientId || !this.clientSecret) {
      throw new TypeError('No clientId or clientSecret')
    }

    const proxy = options.proxy
    if (proxy) {
      if (typeof proxy === 'string') {
        if (proxy.startsWith('http://')) {
          this.agent = new HttpsProxyAgent(proxy)
        } else if (proxy.startsWith('socks://')) {
          this.agent = new SocksProxyAgent(proxy)
        }
      } else if (typeof proxy === 'object') {
        if (!['http', 'socks'].includes(proxy.protocol)) {
          throw new TypeError('proxy.protocol must be one of ["http", "socks"]')
        }
        this.agent = (proxy.protocol === 'http')
          ? new HttpsProxyAgent((proxy.username && proxy.password)
            ? `http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
            : `http://${proxy.host}:${proxy.port}`
          )
          : new SocksProxyAgent((proxy.username && proxy.password)
            ? `socks://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
            : `socks://${proxy.host}:${proxy.port}`
          )
      }
    }
  }

  _getURL (url) {
    url = url.replace(/^\//, '')
    return (this.environment === 'sandbox')
      ? `https://api-demo.airwallex.com/${url}`
      : `https://api.airwallex.com/${url}`
  }

  async _authenticate () {
    const url = `${this._getURL('api/v1/authentication/login')}`
    const key = `airwallex:${this.environment}:${this.clientId}:${this.clientSecret}`
    const token = cache.get(key)
    if (token) {
      return token
    }

    /*
    {
      "expires_at": "2021-10-26T06:38:13+0000",
      "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0b20iLCJyb2xlcyI6WyJ1c2VyIl0sImlhdCI6MTQ4ODQxNTI1NywiZXhwIjoxNDg4NDE1MjY3fQ.UHqau03y5kEk5lFbTp7J4a-U6LXsfxIVNEsux85hj-Q"
    }
     */
    const res = await request({
      method: 'POST',
      url,
      headers: {
        'x-client-id': this.clientId,
        'x-api-key': this.clientSecret
      },
      agent: this.agent,
      json: true
    })

    const data = res.data

    cache.put(key, data.token, (new Date(data.expires_at) - new Date()) - 300000)

    return data.token
  }

  async execute ({ method = 'GET', url, headers = {}, body } = {}) {
    const token = await this._authenticate()
    const requestHeaders = Object.assign({
      Authorization: `Bearer ${token}`
    }, headers)
    const res = await request({
      url: this._getURL(url),
      method,
      headers: requestHeaders,
      agent: this.agent,
      json: true,
      body
    })

    return res.data
  }
}

export default Airwallex
