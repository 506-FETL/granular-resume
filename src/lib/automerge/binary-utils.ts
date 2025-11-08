/*
 * @Author: lll 347552878@qq.com
 * @Date: 2025-11-08 12:16:40
 * @LastEditors: lll 347552878@qq.com
 * @LastEditTime: 2025-11-08 12:38:47
 * @FilePath: /resume/src/lib/automerge/binary-utils.ts
 * @Description: Automerge 二进制数据转换工具,处理 Supabase BYTEA 和 Base64 之间的转换
 */

/**
 * Supabase BYTEA -> Uint8Array
 */
export function byteaToUint8Array(data: unknown): Uint8Array | null {
  if (!data) {
    return null
  }

  // 已经是 Uint8Array
  if (data instanceof Uint8Array) {
    return data
  }

  // 数字数组格式
  if (Array.isArray(data)) {
    return new Uint8Array(data)
  }

  // 字符串格式 (Base64 或 PostgreSQL hex)
  if (typeof data === 'string') {
    return stringToUint8Array(data)
  }

  return null
}

/**
 * 将字符串转换为 Uint8Array，支持 Base64 和 PostgreSQL hex 格式
 */
function stringToUint8Array(str: string): Uint8Array | null {
  try {
    // PostgreSQL BYTEA hex 格式: \x 后跟16进制
    if (str.startsWith('\\x')) {
      return hexToUint8Array(str.slice(2))
    }

    // 直接 Base64 解码
    return base64ToUint8Array(str)
  }
  catch (error) {
    console.error('字符串转 Uint8Array 失败', error)
    return null
  }
}

/**
 * hex字符串 -> Uint8Array
 */
function hexToUint8Array(hexString: string): Uint8Array {
  // hex 字符串实际上是 Base64 字符串的 hex 编码
  let decodedString = ''
  for (let i = 0; i < hexString.length; i += 2) {
    const byte = Number.parseInt(hexString.slice(i, i + 2), 16)
    decodedString += String.fromCharCode(byte)
  }

  // 现在将 Base64 字符串解码为 Uint8Array
  return base64ToUint8Array(decodedString)
}

/**
 * Base64字符串 -> Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64)
  const uint8Array = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i)
  }
  return uint8Array
}

/**
 * Uint8Array -> Base64字符串
 */
export function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  return btoa(String.fromCharCode(...Array.from(uint8Array)))
}
