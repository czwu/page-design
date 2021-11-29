<template>
  <div class="flex-col flex-grow page-props" style="overflow: hidden">
    <el-collapse v-model="activeName" accordion>
      <el-collapse-item title="页面信息" name="base">
        <el-divider>
          组件树
        </el-divider>
        <el-tree
          :data="[meta]"
          :props="treeProps"
          :default-expanded-keys="expandKeys"
          node-key="id"
          draggable
          :allow-drop="allowDrop"
          :allow-drag="allowDrag"
          @node-click="handleNodeClick"
        >
          <span slot-scope="{ node, data }" class="custom-tree-node">
            <span>{{ node.label }}</span>
            <span v-if="data.uuid && data.uuid!=='page'" @click.stop="iconClick(data)">
              <i class="el-icon-edit-outline" />
            </span>
          </span>
        </el-tree>
        <el-divider>
          事件编排
        </el-divider>
        <div style="text-align: center; margin-top: 20px">
          <el-button
            type="primary"
            icon="el-icon-s-tools"
            size="small"
            @click="showEventSetup"
          >事件编排</el-button>
        </div>
        <div v-if="isComponent" class="">
          <el-divider>
            组件配置
          </el-divider>
          <div style="text-align: center; margin-top: 20px">
            <el-button
              type="primary"
              icon="el-icon-s-tools"
              size="small"
              @click="compSetting"
            >组件配置</el-button>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import Metadata from '@/common/metadata'
import { bus, EVENTS } from '@/common/eventBus'
import metadata from '@/common/metadata'
import { getUrlParams } from '@/utils/util'
export default {
  components: {},
  data() {
    return {
      meta: Metadata.meta,
      activeName: 'base',
      expandKeys: [Metadata.meta.id],
      apis: Metadata.meta.apis,
      treeProps: {
        children: 'children',
        label: 'uuid'
      },
      isComponent: getUrlParams('type') === 'components'
    }
  },
  created() {
    bus.$on(EVENTS.PAGE_TAB_CHANGE, () => {
      this.meta = metadata.meta
      this.expandKeys = [Metadata.meta.id]
    })
  },
  methods: {
    handleNodeClick(node, data) {
      let seldom = document.querySelector('.temp-selected')
      seldom && seldom.classList.remove('temp-selected')
      seldom = document.querySelector('[uuid=' + data.data.uuid + ']')
      seldom && seldom.classList.add('temp-selected')
    },
    iconClick(data) {
      Metadata.selectComponent(data.uuid)
    },
    showEventSetup() {
      bus.$emit(EVENTS.SHOW_EVENT_SETUP)
    },
    compSetting() {
      bus.$emit(EVENTS.SHOW_COMP_CONFIG)
    },
    allowDrag(node) {
      return node.level !== 1 && node.data.uuid
    },
    allowDrop(draggingNode, dropNode, type) {
      if (type !== 'inner') {
        if (draggingNode.parent === dropNode.parent || ['form', 'layout'].includes(dropNode.parent.data.name)) {
          return true
        }
      } else if (type === 'inner' && ['form', 'layout'].includes(dropNode.data.name)) {
        return true
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.scroll-y {
  overflow-y: auto;
  overflow-x: hidden;
}
</style>

<style lang="scss">
.page-props {
  .el-collapse-item__header {
    display: flex;
    flex-direction: row;
    background: #d8e3ec;
    height: 40px;
    line-height: 40px;
    padding-left: 20px;
    font-weight: bold;
    color: #666;
  }
  .el-tree-node__content {
    border-bottom: 1px dashed #eee;
    height: 32px;
  }
  .el-collapse {
    border: 1px solid #ebeef5;
  }
  .el-collapse-item__header {
    display: flex;
    flex-direction: row;
    background: #d8e3ec;
    height: 40px;
    line-height: 40px;
    padding-left: 5px;
  }
  .api-list {
    margin: 0 10px;
    .api-item {
      background: #e5edff;
      line-height: 36px;
      padding: 0 10px;
      border-radius: 2px;
      color: #3a70c1;
      margin-top:10px;
      i{
        line-height: 36px;
        font-size: 14px;
        padding:0 0 0 10px;
        cursor: pointer;
      }
    }
  }
}
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
</style>
