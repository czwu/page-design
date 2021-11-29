import Metadata from '@/common/metadata'
export default {
  /**
   * 根据服务接口的参数创建数据模型, Api有入参request,与输出response
   * @param {Object} apiDetail 接口详情
   */
  createModelByApi(apiDetail) {
    const request = apiDetail.requestDetailsResponseVoList || []
    const response = apiDetail.responseDetailsResponseVoList || []
    if (request.length && apiDetail.requestParamType !== 2 && apiDetail.requestParamType !== 3) {
      const modelName = apiDetail.methodName + '_Request'
      // 判断是否有重名模型,如果有,则不继续添加
      if (!Metadata.meta.models.some(item => item.name === modelName)) {
        const model = {
          id: modelName,
          name: modelName,
          apiUcode: apiDetail.apiUcode,
          apiName: apiDetail.interfaceName,
          type: 'request',
          fields: request.map(col => {
            return this.columnToField(col, modelName)
          })
        }
        Metadata.meta.models.push(model)
      }
    }
    if (response && response.length && apiDetail.responseType === 1) {
      const modelName = apiDetail.methodName + '_Response'
      // 判断是否有重名模型,如果有,则不继续添加
      if (!Metadata.meta.models.some(item => item.name === modelName)) {
        const model = {
          id: modelName,
          name: modelName,
          apiUcode: apiDetail.apiUcode,
          apiName: apiDetail.interfaceName,
          type: 'response',
          fields: response.map(col => {
            return this.columnToField(col, modelName)
          })
        }
        Metadata.meta.models.push(model)
      }
    }
  },
  /**
   * 自定义创建数据模型 {name,fields:[]}
   * @param {Object} model 配置
   */
  createModel(model) {
    model.id = model.name
    Metadata.meta.models.push(model)
    // 生成字段的id,当前模型中唯一
    model.fields.forEach(field => {
      this.updateFieldId(field, model.name)
    })
  },

  // 数据模型更新
  updateModel(model) {
    // 重新生成模型字段ID
    model.fields.forEach(field => {
      this.updateFieldId(field, model.name)
    })
  },

  updateFieldId(field, parentId) {
    field.id = parentId ? `${parentId}.${field.name}` : field.name
    if (field.children) {
      field.children.forEach(item => {
        this.updateFieldId(item, field.id)
      })
    }
  },

  columnToField(col, parentId) {
    const id = parentId ? `${parentId}.${col.fieldName}` : col.fieldName
    const field = {
      id,
      name: col.fieldName,
      label: col.fieldRemark || col.fieldName,
      dataType: col.fieldType,
      inputRequired: col.inputRequired
    }
    if (col.childNode && col.childNode.length) {
      field.children = col.childNode.map(col => {
        return this.columnToField(col, id)
      })
    }
    return field
  },
  /**
   * 根据api信息同步该api的相关模型数据
   * @param {Object} apiDetail
   */
  sync(apiDetail) {
    const models = Metadata.meta.models.filter(item => item.apiUcode && item.apiUcode === apiDetail.apiUcode)
    const request = apiDetail.requestDetailsResponseVoList || []
    const response = apiDetail.responseDetailsResponseVoList || []
    const requestModel = models.find(item => item.type === 'request')
    const responseModel = models.find(item => item.type === 'response')
    if (requestModel && request && request.length) {
      const fields = request.map(col => {
        return this.columnToField(col, requestModel.name)
      })
      this.udpateFields(requestModel, fields)
    }
    if (responseModel && response && response.length) {
      const fields = response.map(col => {
        return this.columnToField(col, responseModel.name)
      })
      this.udpateFields(responseModel, fields)
    }
  },

  /**
   * 使用API查询的字段信息,替换模型的字段信息
   * @param {*} model 模型对象
   * @param {*} newFields  字段信息
   */
  udpateFields(model, newFields) {
    const oldFieldMap = {}
    const customFields = []
    model.fields.forEach(field => {
      if (field.custom) {
        customFields.push(field)
      } else {
        oldFieldMap[field.id] = field
      }
    })
    newFields.forEach(field => {
      // 找到原有模型字段的配置信息,并且保留原有配置
      const oldField = oldFieldMap[field.id]
      if (oldField) {
        field.defaultValue = oldField.defaultValue || ''
        field.valueSource = oldField.valueSource || ''
        if (oldField.children && oldField.children.length) {
          field.children = oldField.children
        }
      }
    })
    model.fields = [...newFields, ...customFields]
  }
}
