/**
 * @author い 狂奔的蜗牛
 * @date 2020/6/1
 * @desc 加解密
 */
import uuid from './util';

const CryptoJS = require('crypto-js');
const PLAM_KEY = uuid();

class EncryptAndDecrypt {
  /**
   * DES  ECB模式加密
   * @param message
   */
  static encryptByDESModeEBC(message) {
    const keyHex = CryptoJS.enc.Utf8.parse(PLAM_KEY);
    const encrypted = CryptoJS.DES.encrypt(message, keyHex, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.ciphertext.toString();
  }

  /**
   * DES  ECB模式解密
   * @param ciphertext
   */
  static decryptByDESModeEBC(ciphertext) {
    const keyHex = CryptoJS.enc.Utf8.parse(PLAM_KEY);
    const decrypted = CryptoJS.DES.decrypt({
      ciphertext: CryptoJS.enc.Hex.parse(ciphertext)
    }, keyHex, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  /**
   * md5 加密
   * @param message
   */
  static md5Encrypt(message) {
    return CryptoJS.MD5(message).toString();
  }

  /**
   * base64加密
   * @param message
   */
  static encryptBase64(message) {
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(message));
  }

  /**
   * base64 解密
   * @param message
   */
  static decryptBase64(message) {
    return CryptoJS.enc.Base64.parse(message).toString(CryptoJS.enc.Utf8);
  }
}

export default EncryptAndDecrypt;
