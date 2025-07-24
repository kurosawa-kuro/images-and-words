const fs = require('fs').promises;
const path = require('path');

class UsageService {
  constructor() {
    this.usageFile = path.join(__dirname, '../data/usage.json');
    this.usage = {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      requestsByDate: {},
      lastReset: new Date().toISOString()
    };
    this.init();
  }

  async init() {
    try {
      // データディレクトリが存在しない場合は作成
      const dataDir = path.dirname(this.usageFile);
      try {
        await fs.access(dataDir);
      } catch {
        await fs.mkdir(dataDir, { recursive: true });
      }

      // 既存の使用状況を読み込み
      try {
        const data = await fs.readFile(this.usageFile, 'utf8');
        this.usage = JSON.parse(data);
      } catch {
        // ファイルが存在しない場合は新規作成
        await this.saveUsage();
      }
    } catch (error) {
      console.error('Usage service initialization error:', error);
    }
  }

  async recordUsage(tokens, model = 'gpt-3.5-turbo') {
    const now = new Date();
    const dateKey = now.toISOString().split('T')[0];
    
    // トークン数を記録
    this.usage.totalTokens += tokens;
    this.usage.totalRequests += 1;
    
    // 日別の使用状況を記録
    if (!this.usage.requestsByDate[dateKey]) {
      this.usage.requestsByDate[dateKey] = {
        requests: 0,
        tokens: 0,
        cost: 0
      };
    }
    
    this.usage.requestsByDate[dateKey].requests += 1;
    this.usage.requestsByDate[dateKey].tokens += tokens;
    
    // コスト計算（GPT-3.5-turboの料金: $0.002 per 1K tokens）
    const cost = (tokens / 1000) * 0.002;
    this.usage.totalCost += cost;
    this.usage.requestsByDate[dateKey].cost += cost;
    
    await this.saveUsage();
    
    console.log(`📊 API使用状況: ${tokens}トークン使用 (コスト: $${cost.toFixed(4)})`);
  }

  async saveUsage() {
    try {
      await fs.writeFile(this.usageFile, JSON.stringify(this.usage, null, 2));
    } catch (error) {
      console.error('Usage save error:', error);
    }
  }

  getUsage() {
    return {
      ...this.usage,
      currentMonthCost: this.getCurrentMonthCost(),
      estimatedMonthlyCost: this.getEstimatedMonthlyCost()
    };
  }

  getCurrentMonthCost() {
    const now = new Date();
    const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    
    let monthCost = 0;
    for (const [date, data] of Object.entries(this.usage.requestsByDate)) {
      if (date.startsWith(currentMonth)) {
        monthCost += data.cost;
      }
    }
    
    return monthCost;
  }

  getEstimatedMonthlyCost() {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate();
    
    if (currentDay === 0) return 0;
    
    const currentMonthCost = this.getCurrentMonthCost();
    return (currentMonthCost / currentDay) * daysInMonth;
  }

  async resetUsage() {
    this.usage = {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      requestsByDate: {},
      lastReset: new Date().toISOString()
    };
    await this.saveUsage();
  }
}

// シングルトンインスタンス
const usageService = new UsageService();

module.exports = usageService; 