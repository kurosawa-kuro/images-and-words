const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * 指定されたポートを使用しているプロセスを停止する
 * @param {number} port - 停止するポート番号
 * @returns {Promise<void>}
 */
const killPort = async (port) => {
  try {
    // ポートを使用しているプロセスのPIDを取得
    const { stdout } = await execAsync(`lsof -ti:${port}`);
    
    if (!stdout.trim()) {
      console.log(`ポート${port}は使用されていません`);
      return;
    }
    
    const pids = stdout.trim().split('\n').filter(pid => pid);
    
    if (pids.length === 0) {
      console.log(`ポート${port}は使用されていません`);
      return;
    }
    
    console.log(`ポート${port}を使用しているプロセスを停止中: ${pids.join(', ')}`);
    
    // プロセスを強制終了
    await execAsync(`kill -9 ${pids.join(' ')}`);
    console.log(`ポート${port}のプロセスを停止しました`);
    
  } catch (error) {
    if (error.code === 1) {
      // lsofがプロセスを見つけられなかった場合（正常）
      console.log(`ポート${port}は使用されていません`);
    } else {
      console.log(`ポート${port}の停止中にエラーが発生しました:`, error.message);
    }
  }
};

/**
 * ポートが利用可能かチェックする
 * @param {number} port - チェックするポート番号
 * @returns {Promise<boolean>}
 */
const isPortAvailable = async (port) => {
  try {
    await execAsync(`lsof -ti:${port}`);
    return false; // プロセスが見つかった場合、ポートは使用中
  } catch (error) {
    return true; // エラーの場合、ポートは利用可能
  }
};

/**
 * 利用可能なポートを見つける
 * @param {number} startPort - 開始ポート番号
 * @param {number} maxAttempts - 最大試行回数
 * @returns {Promise<number>}
 */
const findAvailablePort = async (startPort = 3000, maxAttempts = 10) => {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`利用可能なポートが見つかりませんでした (${startPort}-${startPort + maxAttempts - 1})`);
};

module.exports = {
  killPort,
  isPortAvailable,
  findAvailablePort
}; 