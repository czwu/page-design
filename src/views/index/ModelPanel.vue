<template>
  <div class="flex-col flex-grow model-list">
    <div class="flex-row top-tools">
      <el-tooltip
        class="item"
        effect="dark"
        content="视图切换"
        placement="bottom"
      >
        <i class="el-icon-view view-icon" @click="viewChange" />
      </el-tooltip>
      <el-tooltip
        class="item"
        effect="dark"
        content="基于API创建数据模型"
        placement="bottom"
      >
        <i class="p-icon-APIkaifa view-icon" @click="createModel(true)" />
      </el-tooltip>
      <el-tooltip
        class="item"
        effect="dark"
        content="自定义数据模型"
        placement="bottom"
      >
        <i class="p-icon-moxing view-icon" @click="createModel()" />
      </el-tooltip>
    </div>
    <el-divider> <span>模型</span> </el-divider>
    <el-collapse accordion @change="accordion">
      <el-collapse-item
        v-for="model in meta.models"
        :key="model.id"
        class="model-item"
      >
        <template slot="title">
          <el-tooltip
            class="item"
            effect="dark"
            :content="modelTip(model)"
            placement="left"
          >
            <span class="model-label">
              <i
                :class="model.apiUcode ? 'p-icon-APIkaifa' : 'p-icon-moxing'"
                style="margin-right: 4px"
              />
              <span>{{ model.name }}</span>
            </span>
          </el-tooltip>
          <div class="flex-grow" style="width: 10px" />
          <div class="model-tools" @click.stop>
            <i class="el-icon-edit-outline" @click="editModel(model)" />
            <i
              v-if="model.type != 'system'"
              class="el-icon-delete"
              style="color: red"
              @click="removeModel(model)"
            />
          </div>
        </template>
        <div class="model-content">
          <div v-if="model.fields.length>=10" class="model-filter">
            <el-input
              v-model="filterStr"
              placeholder="搜索/过滤"
              clearable
              style="width: 100%"
              size="mini"
              @input="filterModelFields(model)"
            >
              <i slot="suffix" class="el-input__icon el-icon-search" />
            </el-input>
          </div>
          <el-tree
            :data="filterFields || model.fields"
            node-key="id"
            draggable
            :allow-drag="allowDrag"
            :allow-drop="
              () => {
                return false;
              }
            "
            @node-drag-start="handleDragStart"
          >
            <span slot-scope="{ node, data }" class="custom-tree-node">
              <span class="field-name">{{
                mode ? data.name : node.label
              }}</span>
              <span class="data-type">
                <i v-if="data.custom" class="p-icon-moxing" />
                {{ data.dataType }}
              </span>
            </span>
          </el-tree>
        </div>
      </el-collapse-item>
      <el-divider> 已订阅服务 </el-divider>
      <div class="api-list">
        <div v-for="api in apis" :key="api.apiUcode" class="flex-row api-item">
          <div style="cursor: pointer" @click="apiView(api)">
            {{ api.name }}
          </div>
          <div class="flex-grow" />
          <i class="el-icon-refresh-right" @click="apiSync(api)" />
          <i
            class="el-icon-delete"
            style="color: red"
            @click.stop="apiRemove(api)"
          />
        </div>
      </div>
    </el-collapse>
  </div>
</template>

<script>
import metadata from '@/common/metadata'
import service from '@/common/service'
import datamodel from '@/common/datamodel'
import { bus, EVENTS } from '@/common/eventBus'
export default {
  components: {},
  data() {
    return {
      models: null,
      compData: null,
      meta: metadata.meta,
      mode: false,
      apis: metadata.meta.apis,
      filterStr: '',
      filterFields: null,
      filterModelId: ''
    }
  },
  computed: {
    modelTip() {
      return function(model) {
        if (model.apiUcode) {
          return `API [ ${model.apiName} ] 的 ${
            model.type === 'request' ? '入参' : '响应'
          }数据模型`
        } else if (model.type === 'system') {
          return model.label
        } else {
          return '自定义数据模型'
        }
      }
    }
  },
  watch: {},
  mounted() {},
  created() {},
  methods: {
    allowDrag() {
      return true
    },
    handleDragStart(node, ev) {
      const data = {
        type: 'field',
        data: node.data
      }
      ev.dataTransfer.setData('out2design', JSON.stringify(data))
    },
    removeModel(model) {
      metadata.meta.models = metadata.meta.models.filter((d) => d !== model)
    },
    editModel(model) {
      if (model.id === 'props') {
        bus.$emit(EVENTS.SHOW_COMP_CONFIG)
      } else {
        bus.$emit(EVENTS.SHOW_MODEL_EDITOR, model)
      }
    },
    viewChange() {
      this.mode = !this.mode
    },
    createModel(isApi) {
      if (isApi) {
        bus.$emit(EVENTS.SHOW_API_SELECTOR)
      } else {
        bus.$emit(EVENTS.SHOW_MODEL_EDITOR)
      }
    },
    apiView(data) {
      bus.$emit(EVENTS.SHOW_API_SELECTOR, {
        viewMode: true,
        apiUcode: data.apiUcode
      })
    },
    apiRemove({ apiUcode }) {
      this.apis = metadata.meta.apis = metadata.meta.apis.filter(
        (api) => api.apiUcode !== apiUcode
      )
    },
    apiSync(api) {
      service.queryApiInfo(api.apiUcode).then(({ data }) => {
        api.type = data.requestType ? 'get' : 'post'
        api.name = data.interfaceName
        const res = ['', 'Object', 'Array', 'Page']
        api.responseType = res[data.responseType]
        api.url = data.path
        datamodel.sync(data)
        this.$message.success('接口信息同步成功!')
      })
    },
    filterModelFields(model) {
      if (this.filterStr) {
        this.filterFields = model.fields.filter(field => {
          return field.name.indexOf(this.filterStr) !== -1 || field.label.indexOf(this.filterStr) !== -1
        })
      } else {
        this.filterFields = null
      }
    },
    accordion() {
      this.filterStr = ''
      this.filterFields = null
    }
  }
}
</script>
<style lang="scss" scoped>
.model-list {
  position: relative;
  .view-icon {
    padding: 2px 5px;
    cursor: pointer;
  }
  .top-tools {
    padding: 5px 0;
    background: #4d566f;
    color: #ffffff;
  }
}
.model-filter{
  padding:6px;
  border-bottom:1px dashed #eee;
}
.model-label {
  color: #566c84;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.custom-tree-node {
  font-size: 13px;
  line-height: 30px;
  cursor: move;
  width: 90%;
  span.data-type {
    float: right;
    font-size: 11px;
    color: #9fa7e0;
    padding-right: 5px;
  }
  span.field-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
    width: 170px;
  }
}
.model-tools {
  justify-content: flex-end;
  flex-shrink: 0;
  i {
    padding: 0 5px;
    color: #1659c7;
    font-size: 14px;
  }
  margin-right: 10px;
}
.api-list {
  font-size: 13px;
  margin: 0 10px;
  .api-item {
    background: #e5edff;
    line-height: 36px;
    padding: 0 10px;
    border-radius: 2px;
    color: #3a70c1;
    margin-top: 10px;
    i {
      line-height: 36px;
      font-size: 14px;
      padding: 0 0 0 10px;
      cursor: pointer;
    }
  }
}
::v-deep .el-divider__text{
    background-color: #f7f9fc;
}
</style>
<style lang="scss">
.model-list {
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
}

</style>
