// Monta o payload EMV/BR Code do Pix (copia-e-cola / QR estático).
// Segue o padrão BR Code (campos 00, 26, 52, 53, 54, 58, 59, 60, 62, 63 + CRC16-CCITT).

function emv(id: string, value: string): string {
  return `${id}${String(value.length).padStart(2, '0')}${value}`;
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function sanitizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .toUpperCase()
    .slice(0, 25);
}

export interface PixPayloadOptions {
  pixKey: string;
  recipientName: string;
  city?: string;
  amount?: number;
  txid?: string;
}

export function buildPixPayload(opts: PixPayloadOptions): string {
  const gui = emv('00', 'br.gov.bcb.pix') + emv('01', opts.pixKey);

  let payload = emv('00', '01');
  payload += emv('26', gui);
  payload += emv('52', '0000');
  payload += emv('53', '986');
  if (opts.amount !== undefined && opts.amount > 0) {
    payload += emv('54', opts.amount.toFixed(2));
  }
  payload += emv('58', 'BR');
  payload += emv('59', sanitizeName(opts.recipientName));
  payload += emv('60', (opts.city || 'BRASIL').toUpperCase());
  payload += emv('62', emv('05', opts.txid || '***'));
  payload += '6304';
  payload += crc16(payload);

  return payload;
}
