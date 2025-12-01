import MemoryCache from 'memory-cache'

const cache = new MemoryCache.Cache()

class Airwallex {
  constructor (options = {}) {
    this.clientId = options.clientId || options.client_id
    this.clientSecret = options.clientSecret || options.client_secret
    this.environment = options.environment || 'sandbox'

    if (!this.clientId || !this.clientSecret) {
      throw new TypeError('No clientId or clientSecret')
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

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'x-client-id': this.clientId,
        'x-api-key': this.clientSecret
      }
    })

    if (!res.ok) {
      throw new Error(`Authentication request failed with status ${res.status}`)
    }

    const data = await res.json()

    cache.put(key, data.token, (new Date(data.expires_at) - new Date()) - 300000)

    return data.token
  }

  async execute ({ method = 'GET', url, headers = {}, body } = {}) {
    const token = await this._authenticate()
    const requestHeaders = Object.assign({
      Authorization: `Bearer ${token}`
    }, headers)

    const fetchOptions = {
      method,
      headers: requestHeaders
    }

    if (typeof body === 'string') {
      fetchOptions.body = body
    } else {
      if (body != null) {
        fetchOptions.body = JSON.stringify(body)
        requestHeaders['Content-Type'] = 'application/json'
      }
    }

    const res = await fetch(this._getURL(url), fetchOptions)

    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`)
    }

    const data = await res.json()

    return data
  }
}

export default Airwallex
