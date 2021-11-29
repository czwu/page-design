<template>
  <el-drawer
    title="通用代码提示"
    direction="rtl"
    :visible.sync="visible"
    :modal="false"
    :show-close="true"
    :wrapper-closable="false"
    :before-close="handleClose"
    size="100%"
    style="left:inherit;width: 40%"
    @opened="onOpen"
  >
    <div id="codeTips" class="tab-editor" />
  </el-drawer>
</template>

<script>
import { beautifierConf } from '@/common/config'

import loadMonaco from '@/utils/loadMonaco'
import loadBeautifier from '@/utils/loadBeautifier'
const editorObj = {
  js: null
}
const mode = {
  js: 'javascript'
}
var beautifier, monaco
export default {
  name: 'CodeTipsDrawer',
  // eslint-disable-next-line vue/require-prop-types
  props: ['visible'],
  data() {
    return {
      tips: '/***********  弹窗事件  ******** */\n' +
              '/**\n' +
              ' * @function 打开弹窗事件\n' +
              ' * @param {Object} \n' +
              ' * path页面路径：版本号@@@页面code\n' +
              ' * dialogTitle弹窗标题，\n' +
              ' * dialogWidth弹窗宽度，\n' +
              ' * **/\n' +
              'this.$common.openDialog({\n' +
              '  path: \'1.0.0@@@179911381e094cda8b84a089fcdb1dad\',\n' +
              '  dialogTitle: \'新增行政架构\',\n' +
              '  dialogWidth: \'770px\',\n' +
              '})\n' +
              '/**\n' +
              ' * @function 关闭标签或弹窗事件\n' +
              ' * @注意 需要通过call、apply 传入当前this\n' +
              ' * **/\n' +
              'this.$common.closeCurPage.call(this)\n' +
              '/**\n' +
              ' * @function 模板eventBus调用\n' +
              ' * 弹窗更新模板页面数据\n' +
              ' * **/\n' +
              'const option = this.__QUERY_STATIC__.__TEMPLATE_EVENT_BUS_OPTIONS__;\n' +
              'this.$bus.$emit(option.name, option.param);\n' +
              '/***********  参数获取事件  ******** */\n' +
              '/**\n' +
              ' * 项目全局参数\n' +
              ' * **/\n' +
              '// 获取全部用户信息 userInfo\n' +
              'this.$common.getGlobalParamById(\'userInfo\');\n' +
              '// 获取用户账号 account\n' +
              'this.$common.getGlobalParamById(\'userInfo.account\');\n' +
              '/**\n' +
              ' * 保存页面跳转参数[新标签页、弹框页面]-localStorage\n' +
              '@param {String} id 必填 页面id pageCode 当前页面的PageCode = this.__PAGEID__\n' +
              '@param {Object} data 必填 请求参数 统一格式Object对象\n' +
              ' */\n' +
              'this.$common.saveQueryParam({\n' +
              '  id: pageCode,\n' +
              '  data\n' +
              '})\n' +
              '/**\n' +
              ' * 根据pageId获取页面跳转参数-localStorage\n' +
              '@param {String} id 页面id 必填 pageCode 当前页面的PageCode = this.__PAGEID__\n' +
              ' * **/\n' +
              'this.$common.getQueryParamByPageId(id);\n' +
              '/**\n' +
              ' * 根据页面pageId和参数id，获取页面跳转参数\n' +
              '@param {String} pageId 页面id 必填\n' +
              '@param {String} id 参数id 选填 不传返回全部\n' +
              '@注意 如果报错，需要通过call、apply 传入当前this\n' +
              ' */\n' +
              'this.$common.getQueryParamByPageIdAndId({\n' +
              '  pageId,\n' +
              '  id\n' +
              '});\n' +
              '/**\n' +
              ' * 根据请求url参数获取参数\n' +
              '@param {String} id 参数key\n' +
              ' */\n' +
              'this.$common.getQueryByUrl(id);\n' +
              '/**\n' +
              ' * 更新TagsView标签标题\n' +
              ' *  param {String} newTitle 必填 新的TagsView标题\n' +
              ' **/\n' +
              'this.$common.updateTagsViewName(newTitle);\n' +
              '\n' +
              '/***********动态编辑表格调用API方法   ******************* */\n' +
              '/**\n' +
              ' * \n' +
              ' *  如xxx表格调用xxx方法\n' +
              ' *  要注意调用refs时，xxx表格已经渲染，否则会获取不到对象\n' +
              ' **/\n' +
              'this.$refs.xxx.getEffTable().xxx();\n',
      jsCode: ''
    }
  },
  methods: {
    handleClose(done) {
      console.log(this.visible)
      this.$emit('update:visible', false)
      done()
    },
    onOpen() {
      loadBeautifier(btf => {
        beautifier = btf
        this.jsCode = beautifier.js(this.tips, beautifierConf.js)
        loadMonaco(val => {
          monaco = val
          this.setEditorValue('codeTips', 'js', this.jsCode)
        })
      })
    },
    setEditorValue(id, type, codeStr) {
      editorObj[type] = monaco.editor.create(document.getElementById(id), {
        value: codeStr,
        theme: 'vs-dark',
        language: mode[type],
        automaticLayout: true
      })
    }
  }
}
</script>

<style scoped>
  .tab-editor {
    position: absolute;
    top: 58px;
    bottom: 0;
    left: 0;
    right: 0;
    font-size: 14px;
  }
  ::v-deep .el-drawer__header{
    background: #000;
    color: #fff;
    line-height: 33px;
    margin: 0;
    padding: 0 10px;
  }
  ::v-deep .el-drawer__body{
    background: #1e1e1e;
  }
</style>
