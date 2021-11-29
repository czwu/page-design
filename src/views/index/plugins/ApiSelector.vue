<template>
  <el-dialog
    :title="viewMode ? '服务详情' : '选择服务(API)'"
    :visible.sync="visible"
    width="80vw"
    custom-class="api-dialog"
    @close="cancel"
  >
    <div v-loading="loading" class="flex-row dialog-content">
      <div v-if="!viewMode" class="flex-col tree-layout">
        <div style="padding-bottom: 10px">
          <el-input
            v-model="interfaceName"
            placeholder="名称/路径"
            clearable
            class="input-width-select"
            style="width: 100%; border-color: #ecf5e8"
            size="small"
            @keyup.native="filterInterface(true)"
          >
          <el-select  v-model="queryTypeVal" slot="prepend" @change="filterInterface">
                <el-option v-for="item in queryType"
                           :key="item.value"
                           :label="item.label"
                           :value="item.value"></el-option>
              </el-select>
            <i slot="suffix" class="el-input__icon el-icon-search" />
          </el-input>
        </div>
        <div class="flex-col flex-grow" style="overflow: hidden">
          <el-tree
            default-expand-all
            :data="treeData"
            :props="defaultProps"
            style="overflow-y: auto; background: #ecf5e8"
            @node-click="handleClickNode"
          >
            <span
              slot-scope="{ node, data }"
              class="api-tree-node"
              :class="{
                subscribe: data.apiUcode && apiMap[data.apiUcode],
                leaf: data.apiUcode,
              }"
            >
              <span class="name">
                {{ node.label }}
                <span v-if="data.apiUcode && apiMap[data.apiUcode]">(已订阅)</span>
              </span>

            </span></el-tree>
        </div>
      </div>
      <div class="flex-col content-layout flex-grow">
        <div class="api-base flex-row flex-warp">
          <div class="item flex-row span-11">
            <div class="item-label">接口名称</div>
            <div class="item-value">{{ apiDetail.interfaceName }}</div>
          </div>

          <div class="item flex-row span-13">
            <div class="item-label">接口路径</div>
            <div class="item-value">{{ apiDetail.path }}</div>
          </div>
          <div class="item flex-row span-5">
            <div class="item-label">接口类型</div>
            <div class="item-value">
              {{ apiDetail.requestTypeLabel }}
            </div>
          </div>
          <div class="item flex-row span-6">
            <div class="item-label">创建人</div>
            <div class="item-value">{{ apiDetail.createdBy }}</div>
          </div>
          <div class="item flex-row span-13">
            <div class="item-label">更新时间</div>
            <div class="item-value" :title="apiDetail.updateTime">
              {{ apiDetail.updateTime | diffText }}
            </div>
          </div>
        </div>
        <div class="api-detail flex-grow">
          <el-tabs v-model="activeName" type="card">
            <el-tab-pane label="请求参数 (Request) " name="request" />
            <el-tab-pane label="响应对象 (Response)" name="response" />
          </el-tabs>
          <div class="flex-col flex-grow">
            <el-table
              v-show="activeName === 'request'"
              :max-height="maxHeight"
              :data="apiDetail.requestDetailsResponseVoList"
              size="mini"
              border
              row-key="_rowid_"
              :tree-props="{ children: 'childNode' }"
              class="flex-grow"
            >
              <el-table-column label="名称" prop="fieldName" > 
                <template slot-scope="scope" >
                <template v-if="scope.row.fieldName.toLowerCase() === 'baselist'">
                  <span> {{ scope.row.fieldName  }}</span>
                  <el-tooltip content="发起请求时此变量不会采用key-value的方式，而是直接发送value" placement="top" effect="dark">
                    <i class="el-icon-info" />
                  </el-tooltip>
                </template>
                <span v-else> {{ scope.row.fieldName  }}</span>
              </template>
              </el-table-column>
              <el-table-column label="备注" prop="fieldRemark" align="" />
              <el-table-column label="类型" prop="fieldType" align="">
                <template slot-scope="scope">
                  {{ scope.row.fieldTypeRemark || scope.row.fieldType }}
                </template>
              </el-table-column>
              <el-table-column
                label="是否必须"
                prop="inputRequired"
                align="center"
              >
                <template slot-scope="scope">
                  <i
                    v-show="scope.row.inputRequired"
                    class="el-icon-check"
                    style="color: green; font-size: 16px"
                  />
                  <!-- <i v-show="!scope.row.inputRequired" class="el-icon-close" style="color:red;font-size:16px" /> -->
                </template>
              </el-table-column>
            </el-table>
            <el-table
              v-show="activeName === 'response'"
              :max-height="maxHeight"
              :data="apiDetail.responseDetailsResponseVoList"
              border
              size="mini"
              row-key="_rowid_"
              :tree-props="{ children: 'childNode' }"
            >
              <el-table-column label="名称" prop="fieldName" />
              <el-table-column label="备注" prop="fieldRemark" align="" />
              <el-table-column label="类型" prop="fieldType" align="" />
            </el-table>
          </div>
          <!-- <el-table v-show="activeName==='requestHeader'" :max-height="maxHeight" :data="headers" size="mini" border>
            <el-table-column label="参数名称" />
            <el-table-column label="参数值" />
            <el-table-column label="是否必须" />
            <el-table-column label="示例" />
            <el-table-column label="备注" />
          </el-table> -->
        </div>
      </div>
    </div>
    <div v-if="!viewMode" slot="footer" class="dialog-footer">
      <el-button size="small" @click="cancel">关 闭</el-button>
      <el-button
        v-show="apiDetail.apiUcode && !apiMap[apiDetail.apiUcode]"
        size="small"
        type="primary"
        @click="confirm(false)"
      >订阅</el-button>
      <el-button
        v-show="apiDetail.apiUcode && !apiMap[apiDetail.apiUcode]"
        size="small"
        type="primary"
        @click="confirm(true)"
      >订阅并关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import service from '@/common/service'
import Metadata from '@/common/metadata'
import { dateToDiffText, uuid, debounce } from '@/utils/util'
import { bus, EVENTS } from '@/common/eventBus'
import model from '@/common/datamodel'
export default {
  components: {},
  filters: {
    diffText(val) {
      return val ? dateToDiffText(new Date(val)) + ' ㅤ(' + val + ')' : ''
    }
  },
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      apiDetail: {},
      visible: false,
      treeData: [],
      treeDataBuffer: [],
      loading: false,
      interfaceName: '',
      defaultProps: {
        children: 'apis',
        label: 'interfaceName'
      },
      activeName: 'request',
      maxHeight: '400px',
      headers: [],
      viewMode: false,
      apiMap: {},
      queryType: [
        {value:'apiPath',label:'路径' },
        {value:'apiName',label:'名称' },
        {value:'categoryName',label:'分类' },
      ],
      queryTypeVal:'apiName',
    }
  },

  created() {
    bus.$on(EVENTS.SHOW_API_SELECTOR, ({ viewMode, apiUcode } = {}) => {
      this.visible = true
      this.viewMode = viewMode
      if (apiUcode && this.apiDetail.apiUcode !== apiUcode) {
        this.getInterfaceDetail(apiUcode)
      }
      const apiMap = {}
      Metadata.meta.apis.forEach((item) => {
        apiMap[item.apiUcode] = true
      })
      this.apiMap = apiMap
    })
    // const isLuoma =
    //   location.hostname.startsWith('luoma') || getUrlParams('luoma')
    // service.queryApi().then((res) => {
    //   if (res.data.length) {
    //     res.data.map((item) => {
    //       const val = JSON.parse(
    //         JSON.stringify(item)
    //           .replace(/projectName/g, 'interfaceName') // 替换项目字段为应用字段
    //           .replace(/centerName/g, 'interfaceName') // 替换中心字段为应用字段
    //           // .replace(isLuoma ? '------' : /applicationName/g, 'interfaceName') // 替换中心字段为应用字段
    //           .replace(/categoryName/g, 'interfaceName')
    //           .replace(/centers/g, 'apis') // 替换中心集合字段为应用集合
    //           .replace(/applications/g, 'apis') // 替换中心集合字段为应用集合
    //           .replace(/categoryList/g, 'apis')
    //           .replace(/apiList/g, 'apis')
    //       )
    //       this.treeData.push(val)
    //     })
    //     this.treeDataBuffer = this.treeData
    //   }
    // })
    this.getTreeData();
  },
  mounted() {
    this.maxHeight = parseInt(document.body.clientHeight * 0.85 - 240) + 'px'
  },

  methods: {
   getTreeData(params = {}) {
      service.queryApi(params).then((res) => {
      if (res.data.length) {
        let listData = []
        res.data.map((item) => {
          const val = JSON.parse(
              JSON.stringify(item)
                .replace(/projectName/g, 'interfaceName') // 替换项目字段为应用字段
                .replace(/centerName/g, 'interfaceName') // 替换中心字段为应用字段
                // .replace(isLuoma ? '------' : /applicationName/g, 'interfaceName') // 替换中心字段为应用字段
                .replace(/categoryName/g, 'interfaceName')
                .replace(/centers/g, 'apis') // 替换中心集合字段为应用集合
                .replace(/applications/g, 'apis') // 替换中心集合字段为应用集合
                .replace(/categoryList/g, 'apis')
                .replace(/apiList/g, 'apis')
            )
            listData.push(val)
          })
          if(Object.keys(params).length === 0) {
            // 如果对象为空请求的就是所有数据，保存起来
            this.treeDataBuffer = listData
          }
          this.treeData = listData
        }
      })
    },
    cancel() {
      this.visible = false
    },
    confirm(close) {
      this.addApi(this.apiDetail)
      this.$set(this.apiMap, this.apiDetail.apiUcode, true)
      this.apiMap[this.apiDetail.apiUcode] = true
      if (close) {
        this.visible = false
      }
    },
    tabChange() {},
    // 点击树节点
    handleClickNode(item) {
      // 没有apis，代表是接口，而不是分类
      if (item && !item.hasOwnProperty('apis')) {
        this.getInterfaceDetail(item.apiUcode)
      }
    },
    getInterfaceDetail(apiUcode) {
      this.loading = true
      service.queryApiInfo(apiUcode).then(
        (res) => {
          this.apiDetail = res.data || {}
          if (!isNaN(this.apiDetail.requestType)) {
            this.apiDetail.requestTypeLabel = this.apiDetail.requestType
              ? 'GET'
              : 'POST'
          }
          // 处理POST 直接传数组模式
          if (
            this.apiDetail.requestParamType === 2 ||
            this.apiDetail.requestParamType === 3
          ) {
            this.apiDetail.requestDetailsResponseVoList = [
              {
                fieldName: 'baseList',
                fieldRemark: this.apiDetail.requestParamDesc,
                fieldType: this.apiDetail.requestBaseType || `Array`,
                fieldTypeRemark: `Array (${
                  this.apiDetail.requestBaseType || 'Object'
                })`,
                childNode: this.apiDetail.requestDetailsResponseVoList
              }
            ]
          }
          if (this.apiDetail.requestDetailsResponseVoList) {
            this.genListRowId(this.apiDetail.requestDetailsResponseVoList)
          } else {
            this.apiDetail.requestDetailsResponseVoList = []
          }
          if (this.apiDetail.responseDetailsResponseVoList) {
            this.genListRowId(this.apiDetail.responseDetailsResponseVoList)
          } else {
            this.apiDetail.responseDetailsResponseVoList = []
          }

          this.loading = false
        },
        () => {
          this.loading = false
        }
      )
    },
    genListRowId(list) {
      list.forEach((item) => {
        item._rowid_ = uuid(12)
        if (item.childNode && item.childNode.length) {
          this.genListRowId(item.childNode)
        }
      })
    },
    // filterInterface(resetTreeData, interfaceList) {
    //   // 清空，显示全部
    //   if (!this.interfaceName) {
    //     this.treeData = this.treeDataBuffer
    //     return
    //   }
    //   // 搜索，不显示目录，只显示接口
    //   if (resetTreeData) {
    //     this.treeData = []
    //   }
    //   var list = interfaceList || this.treeDataBuffer
    //   var len = list.length
    //   var reg = new RegExp(this.interfaceName)
    //   for (var i = 0; i < len; i++) {
    //     if (list[i].apis && list[i].apis.length) {
    //       this.filterInterface(false, list[i].apis)
    //     } else if (
    //       list[i].interfaceName.match(reg) ||
    //       (list[i].fullPath && list[i].fullPath.match(reg))
    //     ) {
    //       // 如果字符串中不包含目标字符会返回-1
    //       this.treeData.push(list[i])
    //     }
    //   }
    // },
    filterInterface: debounce(async function (){
      //清空，显示全部
      if(this.interfaceName == '') {
        this.treeData = this.treeDataBuffer
        return
      }
      let params = {}
      params[this.queryTypeVal] = this.interfaceName
      this.getTreeData(params);
      this.$forceUpdate()
    }, 500),
    addApi(apiDetail) {
      if (
        Metadata.meta.apis.filter((api) => api.apiUcode === apiDetail.apiUcode)
          .length === 0
      ) {
        const resType = ['', 'Object', 'Array', 'Page']
        const isSeniorQuey = apiDetail.seniorQuerySingleFormVOList && apiDetail.seniorQuerySingleFormVOList.length
        Metadata.meta.apis.push({
          apiUcode: apiDetail.apiUcode,
          name: apiDetail.interfaceName,
          type: apiDetail.requestType ? 'get' : 'post',
          responseType: resType[apiDetail.responseType],
          url: apiDetail.path,
          seniorQuery: isSeniorQuey ? apiDetail.seniorQuerySingleFormVOList : false,
          arrayMode:
            apiDetail.requestParamType === 2 ||
            apiDetail.requestParamType === 3
        })
      }
      model.createModelByApi(apiDetail)
      bus.$emit(EVENTS.SHOW_MODEL_PANEL)
    }
  }
}
</script>

<style lang="scss" scoped>
.tree-layout {
  width: 300px;
  background: #ecf5e8;
  flex-shrink: 0;
}
.content-layout {
  padding: 0 0 0 10px;
  line-height: 30px;
  font-size: 13px;
  overflow: hidden;
  .api-base {
    border-right: 1px solid #eee;
    border-bottom: 1px solid #eee;
    position: relative;
    .item {
      flex-grow: 1;
      border-top: 1px solid #eee;
      border-left: 1px solid #eee;
      box-sizing: border-box;
      .item-label {
        width: 80px;
        padding: 0 10px;
      }
      .item-value {
        flex-grow: 1;
        color: #4179e0;
        font-size: 13px;
      }
    }
  }
  .api-detail {
    padding-top: 10px;
  }
}
.dialog-content {
  height: calc(85vh - 100px);
}
.dialog-footer {
  margin-bottom: -8px;
  // text-align: center;
}
.api-tree-node {
  &.leaf {
    .name {
      font-weight: 300;
      color: #333;
    }
    &.subscribe .name{
      color: blue
    }
  }
  width: 100%;
  line-height: 30px;
  height: 30px;
  padding-right: 50px;
  position: relative;
  .name {
    color: #888;
    font-weight: bold;
  }
  .tool {
    position: absolute;
    right: 0px;
    padding-right: 10px;
    top: 0;
  }
}
::v-deep .api-dialog {
  margin: 60px auto 0 !important;
}
::v-deep .el-dialog__body {
  padding: 0 20px;
}
.input-width-select{
  font-size: 14px;
}
::v-deep .input-width-select .el-input-group__prepend {
  width: 50px;
}
i.el-icon-info {
    color: burlywood;
    margin-left: 2px;
    vertical-align: middle;
    cursor: pointer;
  }
</style>
