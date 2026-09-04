// lib/provenance/tracer.ts

/**
 * Hasil provenance untuk setiap field kritis.
 * - 'verified' → nilai ditemukan di input user.
 * - 'unverified' → nilai tidak ditemukan di input user.
 * - 'unresolved' → nilai tidak bisa diverifikasi (misal format tidak sesuai).
 */
export type FieldStatus = 'verified' | 'unverified' | 'unresolved';

export type ProvenanceResult = {
  /** Status untuk recipient (address) */
  recipient: FieldStatus;
  /** Status untuk amount (angka) */
  amount: FieldStatus;
  /** Status untuk token (nama token) */
  token: FieldStatus;
  /** Status untuk chain ID */
  chainId: FieldStatus;
  /** Ringkasan provenance */
  summary: {
    /** Apakah semua field terverifikasi */
    allVerified: boolean;
    /** Daftar field yang tidak terverifikasi */
    unverifiedFields: string[];
  };
};

/**
 * Fungsi utama provenance: memeriksa apakah nilai-nilai pada action
 * dapat ditelusuri balik ke input user secara literal (deterministik).
 *
 * @param userInput - Teks asli yang diketik user
 * @param action - Objek aksi yang diusulkan agent (recipient, amount, token, chainId)
 * @returns ProvenanceResult dengan status per-field
 *
 * @example
 * const result = traceProvenance(
 *   "Send 50 USDT to Alice",
 *   { recipient: "0x742D...", amount: 50, token: "USDT", chainId: 97 }
 * );
 * // result.recipient = 'unverified' (karena Alice tidak muncul literal di input)
 */
export function traceProvenance(
  userInput: string,
  action: {
    recipient: string;
    amount: number;
    token: string;
    chainId: number;
  }
): ProvenanceResult {
  // Normalisasi input user: lower case, trim
  const normalizedInput = userInput.toLowerCase().trim();
  if (!normalizedInput) {
    // Jika input kosong, semua field tidak terverifikasi
    return createUnverifiedResult();
  }

  // Helper: cek apakah sebuah string muncul (case-insensitive, substring)
  const isValueInInput = (value: string): boolean => {
    if (!value || value.trim() === '') return false;
    return normalizedInput.includes(value.toLowerCase().trim());
  };

  // 1. Cek recipient (address)
  let recipientStatus: FieldStatus = 'unverified';
  if (action.recipient && action.recipient.startsWith('0x')) {
    // Cek full address (case-insensitive)
    if (isValueInInput(action.recipient)) {
      recipientStatus = 'verified';
    } else {
      // Cek partial match: last 8 chars (sering dipakai sebagai identifikasi)
      const last8 = action.recipient.slice(-8);
      if (isValueInInput(last8)) {
        recipientStatus = 'verified';
      } else {
        // Cek prefix '0x' + 4 chars pertama
        const first6 = action.recipient.slice(0, 6);
        if (isValueInInput(first6)) {
          recipientStatus = 'verified';
        } else {
          recipientStatus = 'unverified';
        }
      }
    }
  } else {
    // Jika recipient bukan address, coba sebagai string biasa
    if (isValueInInput(action.recipient)) {
      recipientStatus = 'verified';
    } else {
      recipientStatus = 'unverified';
    }
  }

  // 2. Cek amount (angka)
  const amountStr = action.amount.toString();
  const amountStatus: FieldStatus = isValueInInput(amountStr)
    ? 'verified'
    : 'unverified';

  // 3. Cek token (nama token)
  const tokenStatus: FieldStatus = isValueInInput(action.token)
    ? 'verified'
    : 'unverified';

  // 4. Cek chain ID
  const chainIdStr = action.chainId.toString();
  const chainIdStatus: FieldStatus = isValueInInput(chainIdStr)
    ? 'verified'
    : 'unverified';

  // Kumpulkan hasil
  const fields = [
    { field: 'recipient', status: recipientStatus },
    { field: 'amount', status: amountStatus },
    { field: 'token', status: tokenStatus },
    { field: 'chainId', status: chainIdStatus },
  ];

  const unverifiedFields = fields
    .filter((f) => f.status === 'unverified')
    .map((f) => f.field);

  return {
    recipient: recipientStatus,
    amount: amountStatus,
    token: tokenStatus,
    chainId: chainIdStatus,
    summary: {
      allVerified: unverifiedFields.length === 0,
      unverifiedFields,
    },
  };
}

/**
 * Helper untuk membuat hasil ketika input user kosong.
 */
function createUnverifiedResult(): ProvenanceResult {
  return {
    recipient: 'unverified',
    amount: 'unverified',
    token: 'unverified',
    chainId: 'unverified',
    summary: {
      allVerified: false,
      unverifiedFields: ['recipient', 'amount', 'token', 'chainId'],
    },
  };
}