<template>
  <div class="about">
    <h1>This is an about page</h1>
    <van-button type="default" @click="show = !show">默认按钮</van-button>
    <van-popup v-model="show" position="bottom" :style="{ height: '20%' }">
      <van-picker :columns="columns" @change="onChange" />
    </van-popup>
  </div>
</template>
<script>
const citys = {
  浙江: ['杭州', '宁波', '温州', '嘉兴', '湖州'],
  福建: ['福州', '厦门', '莆田', '三明', '泉州'],
};

export default {
  data() {
    const city1 = '浙江'
    return {
      columns: [
        {
          values: Object.keys(citys),
          className: 'column1'
        },
        {
          values: citys[city1],
          className: 'column2',
          defaultIndex: 2
        },
        {
          values: Object.keys(citys),
          className: 'column3'
        },
        {
          values: citys[city1],
          className: 'column4'
        },
      ],
      show: false
    }
  },
  methods: {
    onChange(picker, values, index) {
      this.$toast(`当前值：${values}, 当前索引：${index}`)
      if (index === 0 ) {
        picker.setColumnValues(1, citys[values[0]]);
        picker.setColumnValues(2, ['q3', 'w3', 'e3']);
        picker.setColumnValues(3, ['q4', 'w4', 'e4']);
      }
      if (index === 1) {
        picker.setColumnValues(2, ['q1', 'w1', 'e1']);
        picker.setColumnValues(3, ['q2', 'w2', 'e2']);
      }
      if (index === 2) {
        picker.setColumnValues(3, ['q2', 'w2', 'e2']);
      }
    }
  }
}
</script>
