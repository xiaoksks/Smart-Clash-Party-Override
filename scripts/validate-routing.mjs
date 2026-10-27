import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import net from 'node:net'
import http from 'node:http'
import dgram from 'node:dgram'
import { spawn } from 'node:child_process'
import { compileOverride } from './compile.mjs'
import { runOverride } from './test-helpers.mjs'
import { ROOT } from './custom-spec.mjs'

const listen = server => new Promise((resolve, reject) => {
  server.once('error', reject)
  server.listen(0, '127.0.0.1', () => resolve(server.address().port))
})
const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
async function freePort() {
  const server = net.createServer()
  const port = await listen(server)
  await new Promise(resolve => server.close(resolve))
  return port
}

function dnsQuestion(host, id = 42) {
  const header = Buffer.alloc(12)
  header.writeUInt16BE(id, 0); header.writeUInt16BE(0x0100, 2); header.writeUInt16BE(1, 4)
  return Buffer.concat([header, ...host.split('.').flatMap(label => [Buffer.from([label.length]), Buffer.from(label)]), Buffer.from([0, 0, 1, 0, 1])])
}

async function queryDns(port, host) {
  const socket = dgram.createSocket('udp4')
  let timer
  try {
    await new Promise((resolve, reject) => {
      timer = setTimeout(() => reject(new Error(`DNS timeout: ${host}`)), 3000)
      socket.once('error', reject)
      socket.once('message', resolve)
      socket.send(dnsQuestion(host), port, '127.0.0.1', error => { if (error) reject(error) })
    })
  } finally { clearTimeout(timer); socket.close() }
}

// Real MRS files are installed by prepareProviders after hash verification.
// All outbound traffic stays on loopback. This test never activates TUN or
// changes the user's running Party profile, DNS settings, or system routes.
export async function validateRouting({ binary, directory, inputs, prepareProviders }) {
  const cases = JSON.parse(await readFile(path.join(ROOT, 'scripts/routing-cases.json'), 'utf8'))
  const sockets = new Set(), proxyHits = [], directHits = [], dnsHits = []
  const track = socket => {
    sockets.add(socket); socket.on('error', () => {}); socket.on('close', () => sockets.delete(socket))
  }
  const spy = http.createServer()
  spy.on('connect', (request, socket) => {
    track(socket); proxyHits.push(request.url)
    socket.write('HTTP/1.1 200 Connection Established\r\n\r\n')
  })
  const echo = net.createServer(socket => { track(socket); directHits.push(socket.remotePort) })
  const resolvers = []
  let child, logs = ''
  async function resolver(label) {
    const server = dgram.createSocket('udp4')
    resolvers.push(server)
    server.on('message', (question, remote) => {
      let end = 12
      const labels = []
      while (question[end]) {
        const size = question[end++]
        labels.push(question.subarray(end, end + size).toString()); end += size
      }
      end += 5
      dnsHits.push({ host: labels.join('.'), resolver: label })
      const header = Buffer.from(question.subarray(0, 12))
      header.writeUInt16BE(0x8180, 2); header.writeUInt16BE(1, 6)
      header.writeUInt16BE(0, 8); header.writeUInt16BE(0, 10)
      const answer = Buffer.from([0xc0, 0x0c, 0, 1, 0, 1, 0, 0, 0, 60, 0, 4, 127, 0, 0, 1])
      server.send(Buffer.concat([header, question.subarray(12, end), answer]), remote.port, remote.address)
    })
    await new Promise(resolve => server.bind(0, '127.0.0.1', resolve))
    return `udp://127.0.0.1:${server.address().port}`
  }
  try {
    const spyPort = await listen(spy), echoPort = await listen(echo)
    const domestic = await resolver('domestic'), foreign = await resolver('foreign')
    const mixedPort = await freePort(), controllerPort = await freePort(), dnsPort = await freePort()
    const code = compileOverride(inputs).code
    const config = await prepareProviders(runOverride(code, { proxies: [
      { name: 'LOCAL-ROUTING-PROXY', type: 'http', server: '127.0.0.1', port: spyPort },
    ] }))
    config.mode = 'rule'
    config.tun.enable = false
    config.listeners = []
    config['mixed-port'] = mixedPort
    config['external-controller'] = `127.0.0.1:${controllerPort}`
    config['allow-lan'] = false
    config['log-level'] = 'info'
    config.profile['store-selected'] = false
    config.dns.listen = `127.0.0.1:${dnsPort}`
    // redir-host lets local upstream DNS counters verify policy selection;
    // HTTP CONNECT still supplies a hostname with no pre-resolved destination IP.
    config.dns['enhanced-mode'] = 'redir-host'
    config.dns['respect-rules'] = false
    config.dns.nameserver = [foreign]
    for (const key of ['default-nameserver', 'proxy-server-nameserver', 'direct-nameserver']) config.dns[key] = [domestic]
    for (const [key, value] of Object.entries(config.dns['nameserver-policy'])) {
      config.dns['nameserver-policy'][key] = [value.some(ns => ns.includes('#')) ? foreign : domestic]
    }
    const file = path.join(directory, 'routing-live.json')
    await writeFile(file, JSON.stringify(config, null, 2) + '\n')
    child = spawn(binary, ['-d', directory, '-f', file], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
    child.stdout.on('data', data => { logs += data })
    child.stderr.on('data', data => { logs += data })
    let launchError
    child.on('error', error => { launchError = error })
    let ready = false
    for (let i = 0; i < 100; i++) {
      if (launchError) throw launchError
      if (child.exitCode !== null) throw new Error(`Core exited: ${logs}`)
      try {
        const response = await fetch(`http://127.0.0.1:${controllerPort}/version`, { signal: AbortSignal.timeout(300) })
        if (response.ok) { ready = true; break }
      } catch {}
      await pause(100)
    }
    assert.ok(ready, `Core did not become ready: ${logs}`)
    const results = []
    for (const entry of cases) {
      const startDns = dnsHits.length
      await queryDns(dnsPort, entry.host)
      const observedDns = dnsHits.slice(startDns).filter(hit => hit.host === entry.host).map(hit => hit.resolver)
      assert.ok(observedDns.length, `No real upstream DNS query: ${entry.host}`)
      assert.ok(observedDns.every(label => label === entry.dns), `DNS mismatch: ${entry.host} wanted ${entry.dns}, got ${observedDns}`)
      const previousDirect = directHits.length, previousProxy = proxyHits.length
      const socket = net.connect(mixedPort, '127.0.0.1')
      track(socket)
      try {
        await new Promise((resolve, reject) => {
          socket.setTimeout(3000, () => reject(new Error(`Connect timeout: ${entry.host}`)))
          socket.once('error', reject)
          socket.once('connect', () => socket.write(`CONNECT ${entry.host}:${echoPort} HTTP/1.1\r\nHost: ${entry.host}:${echoPort}\r\n\r\n`))
          socket.once('data', data => {
            if (!/^HTTP\/1\.1 200/.test(data.toString())) reject(new Error(`Proxy handshake failed: ${entry.host}`))
            else resolve()
          })
        })
        for (let i = 0; i < 100 && directHits.length === previousDirect && proxyHits.length === previousProxy; i++) await pause(10)
        const proxied = proxyHits.slice(previousProxy).some(host => host === `${entry.host}:${echoPort}`)
        const direct = directHits.length > previousDirect
        assert.equal(proxied, entry.exit === 'proxy', `Proxy route mismatch: ${entry.host}`)
        assert.equal(direct, entry.exit === 'direct', `DIRECT route mismatch: ${entry.host}`)
        results.push({ host: entry.host, exit: proxied ? 'proxy' : 'direct', dns: observedDns[0] })
      } finally { socket.destroy() }
    }
    await writeFile(path.join(directory, 'routing-results.json'), JSON.stringify(results, null, 2) + '\n')
    console.log(`Real MRS routing + DNS passed: ${results.length} domain cases`)
  } finally {
    if (child) {
      const exited = new Promise(resolve => child.once('exit', resolve))
      if (child.exitCode === null && child.signalCode === null) { child.kill(); await exited }
    }
    for (const socket of sockets) socket.destroy()
    spy.close(); echo.close()
    for (const server of resolvers) server.close()
    await writeFile(path.join(directory, 'routing-live.log'), logs)
  }
}
