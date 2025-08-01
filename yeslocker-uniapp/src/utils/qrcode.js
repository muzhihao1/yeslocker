/**
 * 二维码生成工具
 * 用于生成凭证二维码和储物柜二维码
 */

/**
 * 生成二维码数据URL
 * @param {string} content 二维码内容
 * @param {Object} options 配置选项
 * @returns {Promise<string>} 返回二维码图片的 data URL
 */
export async function generateQRCode(content, options = {}) {
  const {
    width = 200,
    height = 200,
    margin = 2,
    color = '#000000',
    background = '#FFFFFF'
  } = options
  
  try {
    // 在真实环境中，这里应该调用二维码生成库或后端API
    // 目前返回一个占位图片
    // TODO: 集成实际的二维码生成库，如 qrcode.js
    
    // 临时方案：生成一个包含文本的SVG作为占位
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="${background}"/>
        <rect x="${margin}" y="${margin}" 
              width="${width - margin * 2}" 
              height="${height - margin * 2}" 
              fill="none" 
              stroke="${color}" 
              stroke-width="2"/>
        <text x="50%" y="50%" 
              text-anchor="middle" 
              dominant-baseline="middle" 
              font-family="monospace" 
              font-size="12" 
              fill="${color}">
          ${content.slice(0, 8)}...
        </text>
      </svg>
    `
    
    // 将SVG转换为data URL
    const dataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))
    return dataUrl
  } catch (error) {
    console.error('生成二维码失败:', error)
    throw error
  }
}

/**
 * 生成凭证二维码
 * @param {string} voucherCode 凭证码
 * @returns {Promise<string>} 返回二维码图片URL
 */
export async function generateVoucherQRCode(voucherCode) {
  // 构造凭证二维码数据
  const qrData = JSON.stringify({
    type: 'voucher',
    code: voucherCode,
    timestamp: new Date().getTime()
  })
  
  return generateQRCode(qrData, {
    width: 300,
    height: 300,
    margin: 3
  })
}

/**
 * 生成储物柜二维码
 * @param {string} lockerNumber 储物柜编号
 * @returns {Promise<string>} 返回二维码图片URL
 */
export async function generateLockerQRCode(lockerNumber) {
  // 构造储物柜二维码数据
  const qrData = JSON.stringify({
    type: 'locker',
    lockerNumber: lockerNumber,
    timestamp: new Date().getTime()
  })
  
  return generateQRCode(qrData, {
    width: 200,
    height: 200,
    margin: 2
  })
}

/**
 * 保存二维码到相册
 * @param {string} qrCodeUrl 二维码图片URL
 * @returns {Promise<void>}
 */
export async function saveQRCodeToAlbum(qrCodeUrl) {
  try {
    // 检查保存到相册权限
    const authRes = await uni.authorize({
      scope: 'scope.writePhotosAlbum'
    }).catch(() => null)
    
    if (!authRes) {
      // 用户拒绝授权，引导到设置页
      const modalRes = await uni.showModal({
        title: '提示',
        content: '需要相册权限才能保存图片，请在设置中开启',
        confirmText: '去设置',
        cancelText: '取消'
      })
      
      if (modalRes.confirm) {
        const settingRes = await uni.openSetting()
        if (!settingRes.authSetting['scope.writePhotosAlbum']) {
          throw new Error('未获得相册权限')
        }
      } else {
        throw new Error('用户取消授权')
      }
    }
    
    // 下载图片到本地
    const downloadRes = await uni.downloadFile({
      url: qrCodeUrl
    })
    
    if (downloadRes.statusCode !== 200) {
      throw new Error('下载图片失败')
    }
    
    // 保存到相册
    await uni.saveImageToPhotosAlbum({
      filePath: downloadRes.tempFilePath
    })
    
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })
  } catch (error) {
    console.error('保存二维码失败:', error)
    
    if (error.message !== '用户取消授权') {
      uni.showToast({
        title: error.message || '保存失败',
        icon: 'none'
      })
    }
    
    throw error
  }
}

/**
 * 预览二维码
 * @param {string} qrCodeUrl 二维码图片URL
 */
export function previewQRCode(qrCodeUrl) {
  uni.previewImage({
    urls: [qrCodeUrl],
    current: qrCodeUrl
  })
}

export default {
  generateQRCode,
  generateVoucherQRCode,
  generateLockerQRCode,
  saveQRCodeToAlbum,
  previewQRCode
}