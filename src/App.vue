<template>
  <div class="container">
    <el-row :gutter="20" class="main-content">
      <!-- 左侧待办事项列表 -->
      <el-col :span="12">
        <el-card class="app-card">
          <template #header>
            <div class="card-header">
              <el-row justify="space-between" align="middle">
                <el-col :span="12">
                  <h1>我的任务清单</h1>
                </el-col>
                <el-col :span="12" class="header-right">
                  <el-tag type="success">已完成: {{ completedCount }}</el-tag>
                  <el-tag type="info">总计: {{ ToDoItems.length }}</el-tag>
                </el-col>
              </el-row>
            </div>
          </template>

          <el-form @submit.prevent="addTodo" class="todo-form">
            <el-input
              v-model.trim="label"
              placeholder="添加新任务..."
              :prefix-icon="Edit"
              @keyup.enter="addTodo"
            >
              <template #append>
                <el-button type="primary" @click="addTodo">
                  <el-icon><Plus /></el-icon>
                </el-button>
              </template>
            </el-input>
          </el-form>

          <div class="filters">
            <el-menu mode="horizontal" :default-active="currentFilter" @select="handleFilterChange">
              <el-menu-item index="all">全部任务</el-menu-item>
              <el-menu-item index="active">进行中</el-menu-item>
              <el-menu-item index="completed">已完成</el-menu-item>
            </el-menu>
          </div>

          <el-scrollbar height="500px" class="todo-scrollbar">
            <transition-group name="todo-list" tag="ul" class="todo-list">
              <li v-for="(item, index) in filteredTodoItems" :key="item.id">
                <to-do-item
                  :label="item.label"
                  :done="item.done"
                  :id="item.id"
                  @checkbox-changed="updateDoneStatus(index)"
                  @item-deleted="deleteToDo(index)"
                  @item-edited="editToDo(index, $event)"
                ></to-do-item>
              </li>
            </transition-group>
          </el-scrollbar>

          <el-empty v-if="filteredTodoItems.length === 0" description="暂无任务" />
        </el-card>
      </el-col>

      <!-- 右侧图表 -->
      <el-col :span="12">
        <el-card class="app-card chart-card">
          <template #header>
            <div class="card-header">
              <h1>任务统计</h1>
            </div>
          </template>
          <div class="chart-container">
            <div id="todoChart" style="width: 100%; height: 300px;"></div>
            <div id="progressChart" style="width: 100%; height: 300px;"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import ToDoItem from './components/ToDoItem.vue'
import uniqueId from 'lodash.uniqueid'
import * as echarts from 'echarts'
import { Edit, Plus } from '@element-plus/icons-vue'

export default {
  name: 'app',
  components: {
    ToDoItem
  },
  data() {
    return {
      label: '',
      currentFilter: 'all',
      ToDoItems: JSON.parse(localStorage.getItem('todos')) || [],
      Edit,
      Plus,
      todoChart: null,
      progressChart: null
    }
  },
  mounted() {
    this.initCharts()
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
  computed: {
    completedCount() {
      return this.ToDoItems.filter(item => item.done).length
    },
    filteredTodoItems() {
      switch (this.currentFilter) {
        case 'active':
          return this.ToDoItems.filter(item => !item.done)
        case 'completed':
          return this.ToDoItems.filter(item => item.done)
        default:
          return this.ToDoItems
      }
    }
  },
  methods: {
    addTodo() {
      if (this.label === '') {
        return
      }
      this.ToDoItems.push({
        id: uniqueId('todo-'),
        label: this.label,
        done: false
      })
      this.label = ''
      this.saveTodos()
    },
    updateDoneStatus(index) {
      const item = this.filteredTodoItems[index]
      const originalIndex = this.ToDoItems.findIndex(i => i.id === item.id)
      
      if (originalIndex !== -1) {
        this.ToDoItems[originalIndex].done = !this.ToDoItems[originalIndex].done
        this.saveTodos()
      }
    },
    deleteToDo(index) {
      const item = this.filteredTodoItems[index]
      const originalIndex = this.ToDoItems.findIndex(i => i.id === item.id)
      
      if (originalIndex !== -1) {
        this.ToDoItems.splice(originalIndex, 1)
        this.saveTodos()
      }
    },
    editToDo(index, newData) {
      const item = this.filteredTodoItems[index]
      const originalIndex = this.ToDoItems.findIndex(i => i.id === item.id)
      
      if (originalIndex !== -1) {
        this.ToDoItems[originalIndex] = {
          ...this.ToDoItems[originalIndex],
          label: newData.label
        }
        this.saveTodos()
      }
    },
    saveTodos() {
      localStorage.setItem('todos', JSON.stringify(this.ToDoItems))
    },
    handleFilterChange(value) {
      this.currentFilter = value
    },
    initCharts() {
      this.todoChart = echarts.init(document.getElementById('todoChart'))
      this.progressChart = echarts.init(document.getElementById('progressChart'))
      this.updateCharts()
    },
    updateCharts() {
      // 饼图配置
      const pieOption = {
        title: {
          text: '任务完成情况',
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'horizontal',
          bottom: 'bottom'
        },
        series: [
          {
            name: '任务状态',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '20',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: this.completedCount, name: '已完成', itemStyle: { color: '#52c41a' } },
              { value: this.ToDoItems.length - this.completedCount, name: '未完成', itemStyle: { color: '#1890ff' } }
            ]
          }
        ]
      }

      // 进度条图配置
      const progressOption = {
        title: {
          text: '完成进度',
          left: 'center',
          top: 20,
          textStyle: {
            fontSize: 16
          }
        },
        tooltip: {
          formatter: '{b}: {c}%'
        },
        series: [
          {
            type: 'gauge',
            radius: '75%',
            center: ['50%', '60%'],
            progress: {
              show: true,
              width: 15
            },
            axisLine: {
              lineStyle: {
                width: 15
              }
            },
            axisTick: {
              show: false
            },
            splitLine: {
              distance: -15,
              length: 12,
              lineStyle: {
                width: 2,
                color: '#999'
              }
            },
            pointer: {
              show: false
            },
            axisLabel: {
              distance: 25,
              color: '#999',
              fontSize: 12
            },
            anchor: {
              show: false
            },
            title: {
              show: false
            },
            detail: {
              valueAnimation: true,
              fontSize: 30,
              offsetCenter: [0, '70%'],
              formatter: '{value}%',
              color: 'inherit'
            },
            data: [
              {
                value: this.ToDoItems.length ? (this.completedCount / this.ToDoItems.length * 100).toFixed(1) : 0,
                name: '完成率'
              }
            ]
          }
        ]
      }

      this.todoChart.setOption(pieOption)
      this.progressChart.setOption(progressOption)
    },
    handleResize() {
      this.todoChart?.resize()
      this.progressChart?.resize()
    }
  },
  watch: {
    ToDoItems: {
      deep: true,
      handler() {
        this.saveTodos()
        this.updateCharts()
      }
    }
  }
}
</script>

<style>
.container {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.main-content {
  max-width: 1600px;
  margin: 0 auto;
}

.app-card {
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  height: 100%;
}

.chart-card {
  height: calc(100% - 40px);
}

.card-header {
  background: transparent;
}

.header-right {
  text-align: right;
}

.header-right .el-tag {
  margin-left: 10px;
}

h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
  white-space: nowrap;
}

.todo-form {
  margin: 20px 0;
}

.filters {
  margin: 20px 0;
}

.todo-list {
  list-style: none;
  padding: 0;
}

.todo-list-enter-active,
.todo-list-leave-active {
  transition: all 0.3s ease;
}

.todo-list-enter-from,
.todo-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.el-menu--horizontal {
  border-bottom: none;
  display: flex;
  justify-content: center;
}

.el-menu--horizontal .el-menu-item {
  padding: 0 10px;
  height: 40px;
  line-height: 40px;
  font-size: 14px;
}

.filters .el-menu-item {
  margin: 0 5px;
}

.todo-scrollbar {
  margin: 20px 0;
  padding: 0 10px;
}

.chart-container {
  padding: 20px;
}

/* 自定义滚动条样式 */
.el-scrollbar :deep(.el-scrollbar__bar.is-vertical) {
  width: 6px;
}

.el-scrollbar :deep(.el-scrollbar__thumb) {
  background-color: rgba(144, 147, 153, 0.3);
  border-radius: 3px;
}
</style>
