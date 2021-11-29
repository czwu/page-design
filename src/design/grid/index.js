import context from '@/common/context'
import baseProps from '../baseProps'
import './gridColumn'
import { bus, EVENTS } from '@/common/eventBus'
import { getComponentId, options, setValueByPath } from '@/utils/util'
context.components.grid = {
  // 组件默认配置

  getConfig() {
    return {
      uuid: '',
      name: 'grid',
      props: {
        height: 400,
        'row-height': 36,
        'toolbar-config': {
          buttons: [
          ]
        },
        'footer-action-config': {
          showBorder: true
        }

      },
      design: {
        bindDataAttr: 'data',
        proxyConfig: {
          request: {
            query: null
          }
        }

      },
      columns: [
        { id: 'id', label: '编号', prop: 'id', custom: true, show: true },
        { id: 'name', label: '名称', prop: 'name', custom: true, show: true }
      ],
      class: {},
      style: {},
      slots: [
        getHeaderMeta()
      ],
      events: {},
      ref: true,
      insertInitFn: true
    }
  },
  // 组件的属性配置
  getProperties(meta) {
    const apis = window.getMetaManager().meta.apis || []
    return [
      {
        group: '常用配置',
        groupType: 'collapse',
        properties: [
          baseProps.common.compId(),
          {
            label: '高度',
            mapping: 'props.height',
            type: 'number',
            value: '',
            clearable: true,
            help: '表格高度设置,单位px'
          },
          baseProps.common.span(),
          { label: '列配置', type: 'divider' },
          {
            label: '表头来源',
            mapping: 'design.columnSource',
            type: 'radio',
            options: options({ static: '静态', api: '服务' }),
            value: 'static',
            onChange(val, meta) {
              meta.columns.length = 0
            },
            help: '请选择table的列信息数据来源,切换模式时将清除原有模式的列配置,请谨慎操作'
          },
          {
            label: '选择服务',
            mapping: 'design.columnSourceApi',
            type: 'select',
            options: window.getMetaManager().meta.apis || [],
            labelKey: 'name',
            valueKey: 'apiUcode',
            help: '请选择服务',
            value: '',
            onChange(val, meta) {
              if (val) {
                meta.columns.length = 0
                showColumnsEditor(meta)
              }
            },
            vif(meta) { return meta.design.columnSource === 'api' }
          },
          {
            label: '列配置',
            type: 'button',
            onClick() {
              const meta = context.activeComponent
              showColumnsEditor(meta)
            }
          },
          { label: '组件初始化', type: 'divider' },
          baseProps.common.dataType({
            mapping: 'design.dataType',
            options: options({ dynamic: '模型', api: '服务' }),
            value: 'dynamic',
            onChange(val, meta) {
              const apiUcode = meta.design.columnSourceApi
              if (val === 'api' && apiUcode) {
                meta.design.initApi.apiUcode = apiUcode
                meta.design.initApi.params = []
                // 获取api详细配置,并判断是否需要分页
                const api = window.getMetaManager().meta.apis.find(api => api.apiUcode === apiUcode)
                meta.design.initApi.isSeniorQuery = !!api.seniorQuery
                if (!meta.design.initApi.isSeniorQuery) {
                  delete meta.design.initApi.conditionList
                  delete meta.design.initApi.sortList
                }
                if (api) {
                  meta.props['footer-action-config'].showPager = api.responseType === 'Page'
                }
                return true
              }
            }
          }),
          {
            label: '模型数据',
            mapping: 'props.:data',
            type: 'model',
            checkStrictly: true,
            help: '请选择数据模型',
            value: '',
            vif(meta) { return meta.design.dataType === 'dynamic' }
          },

          {
            label: '选择服务',
            mapping: 'design.initApi.apiUcode',
            type: 'select',
            options: apis,
            labelKey: 'name',
            valueKey: 'apiUcode',
            help: '修改服务将清空原服务的参数配置,请谨慎操作',
            value: '',
            onChange(val, meta) {
              if (val) {
                meta.design.initApi.params = []
                // 获取api详细配置,并判断是否需要分页
                const api = window.getMetaManager().meta.apis.find(api => api.apiUcode === meta.design.initApi.apiUcode)
                meta.design.initApi.isSeniorQuery = !!api.seniorQuery
                if (!meta.design.initApi.isSeniorQuery) {
                  delete meta.design.initApi.conditionList
                  delete meta.design.initApi.sortList
                }
                meta.props['footer-action-config'].showPager = api.responseType === 'Page'
                return true
              } else {
                meta.props['footer-action-config'].showPager = false
              }
            },
            vif(meta) { return meta.design.dataType === 'api' }
          }, {
            label: '参数设置',
            type: 'button',
            buttonText: '设置',
            onClick(e, callback) {
              const apiUcode = meta.design.initApi.apiUcode || ''
              const params = meta.design.initApi.params || []
              if (meta.design.initApi.isSeniorQuery) {
                bus.$emit(EVENTS.SHOW_CONDITION_EDITOR, {
                  conditionList: meta.design.initApi.conditionList || [],
                  sortList: meta.design.initApi.sortList,
                  apiUcode: apiUcode,
                  uuid: meta.uuid,
                  confirm(params) {
                    const initApi = meta.design.initApi
                    initApi.conditionList = params.conditionList
                    initApi.sortList = params.sortList
                    callback()
                  }
                })
              } else {
                bus.$emit(EVENTS.SHOW_PARAMS_EDITOR, {
                  params: params,
                  apiUcode: apiUcode,
                  uuid: meta.uuid,
                  showSearch: meta.props.dynamicSearch,
                  callback(params) {
                    meta.design.initApi.params = params
                  }
                })
              }
            },
            vif(meta) { return meta.design.initApi && meta.design.initApi.apiUcode },
            help: '可设置表格初始化查询的参数'
          }
        ]
      },
      {
        group: '表格列',
        groupType: 'collapse',
        properties: [
          {
            type: '$list',
            mapping: 'columns',
            border: true,
            supportDel: false,
            supportAdd: false,
            value: [],
            columns: [
              {
                mapping: 'label',
                type: 'text',
                value: '',
                style: {
                  width: '150px'
                }
              },
              {
                mapping: 'prop',
                type: 'button',
                buttonText: ' ',
                btnType: 'text',
                icon: 'el-icon-edit-outline',
                onClick(e) {
                  const rowIndex = getRowIndex(e.target)
                  const meta = context.activeComponent
                  const col = meta.columns[rowIndex * 1]
                  col._name_ = 'grid-column'
                  bus.$emit(EVENTS.SHOW_CHILD_PROP, col, meta)
                }

              }

            ]
          }
        ]
      },
      {
        group: '高级配置',
        groupType: 'collapse',
        properties: [
          {
            group: true,
            class: 'flex-row flex-wrap',
            properties: [
              {
                label: '显示序号',
                type: 'bool',
                value: false,
                mapping: 'design.showIndex',
                help: '是否显示序号列'
              },
              {
                label: '选择列',
                type: 'bool',
                value: false,
                mapping: 'design.showSelection',
                help: '是否显示选择框'
              }, {
                label: '多选模式',
                type: 'bool',
                value: true,
                mapping: 'design.multiple',
                help: '默认为多选 checkbox 模式, 单选为radio模式'
              }, {
                label: '编辑',
                type: 'bool',
                value: false,
                mapping: 'props.edit',
                help: '是否启用编辑功能'
              }, {
                label: '合计',
                type: 'bool',
                value: false,
                mapping: 'props.show-summary',
                help: '是否在表尾显示合计行'
              }, {
                label: '区域选择',
                type: 'bool',
                value: false,
                mapping: 'props.selectRange',
                help: '是否开启区域选择功能'
              }, {
                label: '复制',
                type: 'bool',
                value: false,
                mapping: 'props.copy',
                help: '是否开启复制功能'
              },
              {
                label: '边框',
                type: 'bool',
                value: true,
                mapping: 'props.border',
                help: '是否显示单元格纵向边框'
              }, {
                label: '显示表头',
                type: 'bool',
                value: true,
                mapping: 'props.show-header',
                help: '是否显示表头'
              }, {
                label: '全屏按钮',
                type: 'bool',
                value: false,
                mapping: 'props.toolbar-config.fullscreen',
                help: '是否显示全屏按钮'
              }, {
                label: '列拖动',
                type: 'bool',
                value: false,
                mapping: 'props.drag',
                help: '是否启用列拖动'
              }, {
                label: '列控制',
                type: 'bool',
                value: false,
                mapping: 'props.toolbar-config.columnControl',
                help: '开启列控制功能（显示/隐藏）'
              }, {
                label: '批量控制',
                type: 'bool',
                value: false,
                mapping: 'props.toolbar-config.columnBatchControl',
                help: '开启列批量控制功能（显示/隐藏、排序、列固定）'
              }, {
                label: '替换填充',
                type: 'bool',
                value: false,
                mapping: 'props.toolbar-config.showReplace',
                help: '启用替换和填充功能'
              }, {
                label: '高级搜索',
                type: 'bool',
                value: false,
                mapping: 'props.toolbar-config.diySearch',
                help: '启用替换和填充功能'
              }, {
                label: '刷新功能',
                type: 'bool',
                value: false,
                mapping: 'props.toolbar-config.refresh',
                help: '启用替换和填充功能'
              }, {
                label: '展开行',
                type: 'bool',
                value: false,
                mapping: 'design.showExpand',
                help: '是否支持行展开功能',
                onChange(val, meta) {
                  if (val) {
                    if (!meta.slots[1]) {
                      meta.slots.push(getExpandSlot())
                    }
                  } else {
                    if (meta.slots[1]) {
                      meta.slots.pop()
                    }
                  }
                  return true
                }
              },
              {
                label: '自定义分页',
                type: 'bool',
                value: false,
                mapping: 'props.footer-action-config.showPager',
                help: '是否使用自定义的分页数据'
              }
            ]
          },
          {
            label: '分页尺寸',
            mapping: 'props.footer-action-config.pageConfig.pageSize',
            type: 'select',
            options: [10, 20, 30, 50, 100],
            value: 10,
            help: '默认的分页尺寸'
          },
          {
            label: '工具按钮',
            type: 'select',
            multiple: true,
            value: '',
            options: options({
              add_focus: '新增',
              insert_focus: '插入',
              delete: '直接删除',
              mark_cancel: '删除/取消',
              save: '保存'
            }),
            mapping: 'design.buttons',
            help: '表格数据的唯一标识字段名,默认值为id'
          },
          {
            label: '主键字段',
            type: 'input',
            value: '',
            mapping: 'props.rowId',
            help: '表格数据的唯一标识字段名,默认值为id'
          },
          {
            label: '合计文本',
            type: 'i18n',
            value: '合计',
            mapping: 'props.sum-text',
            help: '合计行第一列的文本',
            vif: 'props.show-summary'
          }, {
            label: '合计函数',
            mapping: 'props.:summary-method',
            type: 'method',
            onlyCode: true,
            value: '',
            vif: 'props.show-summary',
            help: '自定义的合计计算方法,Function({ columns, data })'
          },
          {
            label: '行高',
            mapping: 'props.row-height',
            type: 'number',
            value: 36,
            clearable: true,
            help: '表格行高度,默认为36px'
          }, {
            label: '行类名',
            mapping: 'props.:row-class-name',
            type: 'method',
            onlyCode: true,
            value: '',
            help: '表格行的动态类名,Function({row, rowIndex})'
          }, {
            label: '列类名',
            mapping: 'props.:cell-class-name',
            type: 'method',
            onlyCode: true,
            value: '',
            help: '单元格的动态类名,Function({row, column, rowIndex, columnIndex})'
          }, {
            label: '插入前',
            mapping: 'props.:beforeInsert',
            type: 'method',
            onlyCode: true,
            value: '',
            help: '插入数据前的钩子函数,function(records)'
          }, {
            label: '数据加工',
            mapping: 'design.initApi.resultTransform',
            type: 'method',
            onlyCode: true,
            value: '',
            vif(meta) { return meta.design.initApi && meta.design.initApi.apiUcode },
            help: '如需要对服务返回的数据做加工处理,可选择自定义函数,并在方法内返回修正好的数据'
          },
          {
            label: '列行合并',
            mapping: 'props.:span-method',
            type: 'method',
            onlyCode: true,
            value: '',
            help: '合并行或列的计算方法,Function({ row, column, rowIndex, columnIndex }),备注:支持编辑及复制功能，不能用于虚拟滚动、树形结构、展开行、固定列'
          },
          baseProps.common.classList(),
          baseProps.common.vif()
        ]
      }
    ]
  },

  getEvents() {
    return [
      { id: 'select', label: '勾选 Checkbox 时触发的事件' },
      { id: 'select-all', label: '勾选全选 Checkbox 时触发的事件' },
      { id: 'selection-change', label: '当选择项发生变化事件' },
      { id: 'cell-click', label: '单元格点击事件' },
      { id: 'row-click', label: '行点击事件' },
      { id: 'header-click', label: '列头点击事件' },
      { id: 'delete_click', label: '删除按钮点击事件' },
      { id: 'save_click', label: '保存按钮点击事件' },
      { id: 'data-change', label: '当表格发生数据变更时触发' }
    ]
  },
  getMockData(meta) {
    const data = [{ id: 1 }]
    meta.columns.forEach(col => {
      if (col.prop) {
        setValueByPath(data[0], col.prop, 1)
      }
    })
    return data
  },

  beforeRender(renderOpts) {
    renderOpts.on['header-click'] = function({ column, cell, event }) {
      const metadata = window.getMetaManager()
      const uuid = getComponentId(event.target)
      const comp = metadata.getComponentById(uuid)
      if (comp && column.id) {
        let meta = null
        comp.columns.find(col => {
          if (col.id === column.id) {
            meta = col
            return true
          } else if (col.children && col.children.length) {
            meta = col.children.find(item => item.id === column.id)
            return meta
          }
        })
        if (meta && meta !== context.activeMeta) {
          meta._name_ = 'grid-column'
          meta.design = meta.design || {}
          metadata.selectMetadata(meta, comp)
          event.stopPropagation()
        }
      }
    }
  }

}

function getHeaderMeta() {
  return Object.assign(context.getConfig('layout'), {
    slot: 'toolbar',
    design: {
      mapping: 'slots.0',
      layout: 'row'
    },
    style: {
      'flex-wrap': 'wrap',
      'width': '200px'
    },
    children: []
  })
}
function getExpandSlot() {
  return Object.assign(context.getConfig('layout'), {
    slot: 'expand',
    design: {
      mapping: 'slots.1',
      layout: 'row'
    },
    props: {
      'slot-scope': 'scope'
    },
    style: {
      'flex-wrap': 'wrap'
    },
    children: []
  })
}

function showColumnsEditor(meta) {
  const apiUcode = meta.design.columnSourceApi
  bus.$emit(EVENTS.SHOW_COLUMNS_EDITOR, {
    columns: meta.columns,
    apiUcode: apiUcode,
    complexHeader: true || meta.design['multi-level-header'],
    callback(columns) {
      meta.columns.length = 0
      meta.columns.push(...columns)
    }
  })
}

function getRowIndex(node) {
  let rowindex
  let el = node
  while (el) {
    rowindex = el.getAttribute('rowindex')
    if (rowindex) {
      break
    } else {
      el = el.parentElement
    }
  }
  return rowindex
}

