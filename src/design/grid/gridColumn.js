import context from '@/common/context'
import { options } from '@/utils/util'
import baseProps from '../baseProps'
import { bus, EVENTS } from '@/common/eventBus'
context.components['grid-column'] = {
  // 组件默认配置
  getConfig() {
    return {
      name: 'grid-column',
      label: '',
      prop: '',
      width: '',
      config: {},
      editable: false,
      edit: {},
      design: {}
    }
  },
  // 组件的属性配置
  getProperties(meta) {
    return [
      {
        group: '数据列配置',
        groupType: 'collapse',
        properties: [
          baseProps.common.compId(),
          {
            label: '列标题',
            mapping: 'label',
            type: 'i18n',
            value: '',
            help: '显示的标题'
          }, {
            label: '字段名',
            mapping: 'prop',
            type: 'input',
            disabled: true,
            value: '',
            help: '对应列内容的字段名，对象字段可以通过路径, 例如: user.name'
          },
          {
            label: '渲染组件',
            mapping: 'renderName',
            type: 'select',
            options: options({
              '': '默认',
              text: '文本',
              select: '文本(枚举)',
              button: '按钮',
              checkbox: '复选框',
              cascader: '级联选择',
              'date-picker': '日期选择器',
              'time-picker': '时间选择器',
              'layout': '自定义布局'
            }),
            clearable: true,
            value: '',
            onChange(val, meta) {
              if (val) {
                const comp = context.getConfig(val, meta)
                comp.design.mapping = 'children'
                if (val === 'text') {
                  // comp.children = `{{scope.row.${meta.prop}}}`
                } else if (val === 'layout') {
                  comp.slot = 'default'
                } else {
                  comp.unaided = false
                }
                meta.config = comp
              } else {
                meta.config = {}
              }
              return true
            },
            help: '默认不使用组件渲染,直接显示文本, 如需要渲染成其他类型,请选择具体组件类型'
          }, {
            label: ' ',
            type: 'button',
            onClick() {
              const comp = meta.config
              if (comp) {
                bus.$emit(EVENTS.SHOW_CHILD_PROP, comp, meta)
              }
            },
            vif: 'renderName'
          },
          {
            label: '启用编辑',
            type: 'bool',
            value: true,
            mapping: 'editable',
            help: '是否启用单元格编辑功能'
          },
          baseProps.common.width({ mapping: 'width', type: 'input', help: '对应列的宽度', format: null }),
          {
            label: '内容对齐',
            type: 'radio',
            value: '',
            mapping: 'align',
            options: options({ '': '靠左', center: '居中', right: '靠右' }),
            help: '列文本内容对齐方式'
          }, {
            label: '表头对齐',
            type: 'radio',
            value: '',
            mapping: 'headerAlign',
            options: options({ '': '靠左', center: '居中', right: '靠右' }),
            help: '表头对齐方式，若不设置该项，则使用表格的对齐方式'
          },
          {
            label: '是否必填',
            type: 'bool',
            mapping: 'required',
            value: true,
            vif: 'editable',
            help: '编辑状态下的必填校验'
          },
          { type: 'divider', label: '校验规则', vif: 'editable' },
          {
            type: 'validator',
            mapping: 'rules',
            value: [],
            vif: 'editable'
          }
          // ...baseProps.common.permission()
        ]
      },
      {
        group: '高级配置',
        groupType: 'collapse',
        properties: [
          {
            label: '可排序',
            type: 'bool',
            value: false,
            mapping: 'sortable',
            help: '是否可以排序'
          }, {
            label: '可拖拽',
            type: 'bool',
            value: false,
            mapping: 'drag',
            help: '该列是否可拖动'
          },
          // {
          //   label: '可展开',
          //   type: 'bool',
          //   value: false,
          //   mapping: 'expand',
          //   onChange(val, meta) {
          //     meta.type = val ? 'expand' : ''
          //   },
          //   help: '显示为一个可展开的按钮'
          // },
          // {
          //   label: '编辑组件',
          //   mapping: 'editorName',
          //   type: 'select',
          //   options: options({
          //     '': '默认',
          //     input: '输入框',
          //     checkbox: '复选框',
          //     'checkbox-group': '复选框组',
          //     'radio-group': '单选框组',
          //     select: '下拉选择',
          //     inputNumber: '数字输入框',
          //     switch: '开关',
          //     'date-picker': '日期选择器',
          //     'time-picker': '时间选择器'
          //   }),
          //   clearable: true,
          //   value: '',
          //   onChange(val, meta) {
          //     if (val) {
          //       const comp = context.getConfig(val, meta)
          //       comp.design.mapping = 'children'
          //       if (val === 'layout') {
          //         comp.design.span = 24
          //       } else {
          //         comp.unaided = false
          //       }
          //       meta.edit.render = comp
          //     } else {
          //       delete meta.edit.render
          //     }
          //     return true
          //   },
          //   vif: 'editable',
          //   help: '编辑状态组件,一般无需设置'
          // },
          // {
          //   label: ' ',
          //   type: 'button',
          //   onClick(e) {
          //     const uuid = getComponentId(e.target)
          //     const meta = window.getMetaManager().getComponentById(uuid)
          //     const comp = meta.config
          //     if (comp) {
          //       bus.$emit(EVENTS.SHOW_CHILD_PROP, comp, meta)
          //     }
          //   },
          //   vif: 'edit.render'
          // },
          {
            label: '固定列',
            mapping: 'fixed',
            type: 'select',
            options: options({ '': '不固定', 'left': '左侧固定', 'right': '右侧固定' }),
            value: '',
            help: '列是否固定在左侧或者右侧'
          },
          {
            label: '渲染函数',
            mapping: 'cellRender',
            type: 'method',
            onlyCode: true,
            value: '',
            help: '使用自定义方法渲染单元格内容 - Function(h, {row, rowIndex, column, columnIndex, prop})'
          },
          {
            label: '列头渲染',
            mapping: 'titleRender',
            type: 'method',
            onlyCode: true,
            value: '',
            help: '使用自定义方法渲染列标题 - Function(h, {title, column, columnIndex}) '
          }, {
            label: '是否禁用',
            mapping: 'edit.disabled',
            type: 'method',
            onlyCode: true,
            value: '',
            help: '通过函数返回值,function({row, rowIndex}) ,控制单元格是否可以编辑',
            vif: 'editable'
          }
        ]
      }
    ]
  }
}

