<template>
  <div class="props-field flex-row">
    <span v-if="prop.label" class="prop-label">
      {{ prop.label }}
      <el-tooltip
        v-if="prop.help"
        class="item"
        effect="dark"
        :content="prop.help"
        placement="top"
      >
        <i class="el-icon-info" />
      </el-tooltip>
    </span>
    <span class="prop-content flex-grow">
      <v-render :config="config" :context="{}" />
    </span>
  </div>
</template>
<script>
import propsEditor from './propsEditor'
import { clone, getValueByPath } from '@/utils/util'
export default {
  name: 'PropsField',
  components: {},
  // eslint-disable-next-line vue/require-prop-types
  props: ['prop', 'clone', 'data', 'uuid'],
  data() {
    return {
      fields: [],
      propsType: '',
      config: null
    }
  },
  watch: {
    prop: {
      handler(val, oldVal) {
        this.refreshConfig()
      },
      deep: true
    },
    data: {
      handler(data, oldVal) {
        if (this.config && data && this.config.props) {
          const val = getValueByPath(data, this.prop.mapping)
          this.config.props.value = val
        }
      },
      deep: true
    }
  },
  created() {
    this.refreshConfig()
  },
  methods: {
    refreshConfig() {
      if (this.prop) {
        const prop = this.clone ? clone(this.prop) : this.prop
        if (this.data) {
          const val = getValueByPath(this.data, prop.mapping)
          prop.value = val
        }
        this.config = propsEditor.getEditor(prop, (ctx) => {
          this.$emit('change', ctx)
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.props-field {
  line-height: 36px;
  padding: 0 5px;
  margin-top: 3px;
}
.prop-label {
  width: 90px;
  font-size: 13px;
  text-align: right;
  flex-shrink: 0;
  padding-right: 8px;
}
.prop-content {
  font-size: 13px;
  color: rgb(56, 56, 206);
}
i.el-icon-info {
  color: burlywood;
  margin-left: 2px;
  vertical-align: middle;
  cursor: pointer;
}
.prop-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
