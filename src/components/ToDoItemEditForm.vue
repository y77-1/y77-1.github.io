<template>
  <el-form @submit.prevent="onSubmit" class="edit-form">
    <el-form-item>
      <el-input
        v-model.trim="newLabel"
        :placeholder="`编辑: ${label}`"
        ref="input"
        @keyup.enter="onSubmit"
        @keyup.esc="onCancel"
      />
    </el-form-item>
    <el-form-item>
      <el-button-group>
        <el-button @click="onCancel" size="small">取消</el-button>
        <el-button type="primary" native-type="submit" size="small">保存</el-button>
      </el-button-group>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      newLabel: this.label
    }
  },
  mounted() {
    this.$nextTick(() => {
      if (this.$refs.input) {
        this.$refs.input.focus()
      }
    })
  },
  methods: {
    onSubmit() {
      if (this.newLabel && this.newLabel !== this.label) {
        this.$emit('item-edited', {
          label: this.newLabel
        })
      } else {
        this.$emit('edit-cancelled')
      }
    },
    onCancel() {
      this.$emit('edit-cancelled')
    }
  }
}
</script>

<style scoped>
.edit-form {
  margin-top: 10px;
}

.el-button-group {
  margin-top: 10px;
}

.el-date-picker {
  width: 100%;
}
</style>
  