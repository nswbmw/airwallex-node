const request = require('request-promise')
const MemoryCache = require('memory-cache')
const HttpsProxyAgent = require('https-proxy-agent')
const { SocksProxyAgent } = require('socks-proxy-agent')

const pkg = require('./package')
const cache = new MemoryCache.Cache()

function Airwallex (options = {}) {
  this.clientId = options.clientId || options.client_id
  this.clientSecret = options.clientSecret || options.client_secret
  this.environment = options.environment || 'sandbox'

  if (!this.clientId || !this.clientSecret) {
    throw new Error('No clientId or clientSecret')
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
        throw new Error('proxy.protocol must be one of ["http", "socks"]')
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

  return this
}

Airwallex.prototype._getURL = function (url) {
  url = url.replace(/^\//, '')
  return (this.environment === 'sandbox')
    ? `https://api-demo.airwallex.com/${url}`
    : `https://api.airwallex.com/${url}`
}

Airwallex.prototype._authenticate = async function () {
  const url = `${this._getURL('api/v1/authentication/login')}`
  const key = `${pkg.name}:token`
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
  const response = await request({
    method: 'post',
    url,
    headers: {
      'x-client-id': this.clientId,
      'x-api-key': this.clientSecret
    },
    json: true,
    agent: this.agent
  })

  cache.put(key, response.token, (new Date(response.expires_at) - new Date()) - 300000)

  return response.token
}

Airwallex.prototype.execute = async function ({ method = 'get', url, headers = {}, body }) {
  url = this._getURL(url)

  const token = await this._authenticate()
  const payload = {
    method,
    url,
    json: true,
    headers: Object.assign({
      Authorization: `Bearer ${token}`
    }, headers),
    agent: this.agent
  }

  if (body) {
    payload.body = body
  }

  return request(payload)
}

module.exports = Airwallex
