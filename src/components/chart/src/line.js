import { BaseChart } from './pie'

class Line extends BaseChart {
  getOption() {
    const config = this.config
    const values = this.getValue(config)
    return {
      color: ['#0189FD', '#0CB69C', '#FFA301', '#AEFF01', '#01D5FF', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {},
      xAxis: [{
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        axisLine: {
          lineStyle: {
            color: '#bbb'
          }
        },
        axisLabel: {
          color: '#666'
        },
        axisTick: {
          lineStyle: {
            color: '#999'
          }
        }
      }],
      yAxis: [{
        axisLine: {
          show: false
        },
        axisTick: {
          lineStyle: {
            color: '#999'
          }
        },
        type: 'value',
        splitLine: {
          interval: '200',
          lineStyle: {
            // 使用深浅的间隔色
            color: ['#ddd'],
            width: 1,
            type: 'dashed'
          }
        }
      }],
      series: [{
        name: '直接访问',
        type: 'bar',
        barWidth: '20',
        data: [10, 52, 200, 334, 390, 330, 220]
      }, {
        name: '直接访问1',
        type: 'bar',
        barWidth: '20',
        data: [10, 52, 200, 334, 390, 330, 220],
        itemStyle: {
          normal: {
            barBorderRadius: [10, 10, 0, 0]
          }
        }
      }]
    }
  }

  getValue() {
    const conf = this.config
    const values = []
    conf.data && conf.data.forEach(item => {
      values.push({ value: item[conf.valueKey || 'value'], name: item[conf.labelKey || 'label'] })
    })
    return values
  }
}
export default Line
