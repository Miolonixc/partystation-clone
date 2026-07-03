import { createSocket } from 'dgram';
import { networkInterfaces } from 'os';

const DISCOVERY_PORT = 41234;
const MAGIC = 'PARTYSTATION';

export function startDiscoveryServer(serverPort: number) {
  const udp = createSocket('udp4');

  udp.on('message', (msg, rinfo) => {
    if (msg.toString() === MAGIC) {
      const response = JSON.stringify({
        magic: MAGIC,
        port: serverPort,
        ip: rinfo.address,
      });
      udp.send(response, rinfo.port, rinfo.address);
      console.log(`[discovery] responded to ${rinfo.address}:${rinfo.port}`);
    }
  });

  udp.bind(DISCOVERY_PORT, () => {
    udp.setBroadcast(true);
    console.log(`[discovery] listening on UDP ${DISCOVERY_PORT}`);
  });

  return udp;
}
