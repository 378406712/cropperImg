<script setup>
import { ref,  computed, reactive,onMounted, onUpdated,watch,nextTick  } from 'vue'
 let state = reactive({ count: 0 })
const obj = reactive({
  nested: { count :0},
  arr: ['foo', 'bar']
})
const refCount = ref(0)
const add = () => {
  state.count++
}
const mutateDeeply = () =>{
  obj.nested.count ++
  obj.arr.push('baz')
  obj.arr = [...new Set(obj.arr)]
}
const object = { foo: ref(1) }
const otherCount  = ref(2)
object.foo = otherCount

const books = reactive([ref('Vue 3 Guide')])
const { foo } = object
const page = ref(2)

const author = reactive({
  name: 'John Doe',
  books: [
    'Vue 2 - Advanced Guide',
    'Vue 3 - Basic Guide',
    'Vue 4 - The Mystery'
  ]
})
const deleteBook = (index) => {
  author.books.splice(index, 1)
}
const publishComputed = computed(() => {
  return author.books.length > 0 ? 'Yes' : 'No'
})
const now = ref(Date.now())

let firstName = ref('John')
let lastName = ref('Doe')

const fullName = computed({
  // getter
  get() {
    return firstName.value + ' ' + lastName.value
  },
  // setter
  set(newValue) {
    // 注意：我们这里使用的是解构赋值语法
    [firstName.value, lastName.value] = newValue.split(' ')
    firstName.value += ' nba '
  }
})
fullName.value = 'james harden'
const nameStyle = reactive({
  color: 'red',
  fontSize: '18px'
})
const myObject = reactive({
  title: 'How to do lists in Vue',
  author: 'Jane Doe',
  publishedAt: '2016-04-10'
})
const name = ref('Vue.js')

function greet(event) {
  alert(`Hello ${name.value}!`)
  // `event` 是 DOM 原生事件
  if (event) {
    alert(event.target.tagName)
  }
}
const toAlert1 = ()=> {
  alert('toAlert1')
}
const toAlert2 = ()=> {
  alert('toAlert2')
}
const ctrl = () =>{
  alert('ctrl')
}
const msg = ref('')
onMounted(() => {
  console.log('组件被创建')
})
onUpdated(()=>{
  console.log('数据更新')
})
const question = ref('')
const answer = ref('Questions usually contain a question mark. ;-)')

// 可以直接侦听一个 ref
watch(question, async (newQuestion, oldQuestion) => {
  if (newQuestion.indexOf('?') > -1) {
    answer.value = 'Thinking...'
    try {
      const res = await fetch('https://yesno.wtf/api')
      answer.value = (await res.json()).answer
    } catch (error) {
      answer.value = 'Error! Could not reach the API. ' + error
    }
  }
})
</script>

<template>
  <main v-if="page === 1">
    count: {{ state.count }}
    <button @click="add">+1</button>
    <div>
      obj.count: {{ obj.nested.count }}
    </div>
    <div>
      obj.arr: {{  obj.arr  }}
    </div>
    <button @click="mutateDeeply">深层响应添加</button>
    <div>
      refCount: {{  refCount  }}
    </div>
    <div>object.foo : {{ foo }}</div>
    <div>
      refReactive: {{ books[0].value }}
    </div>
  </main>
  <main v-if="page === 2">
    作者: {{ author.name }}
    <br>
    图书: <div v-for="(item, index) in author.books" :key="index"> <button @click="deleteBook(index)">删除</button> ---- {{ item }}</div>
    <div>
      <p>Has published books:</p>
      <span>{{ publishComputed }}</span>
    </div>
    <div>now: {{  now }}😢</div>
    <div :style="[nameStyle,{display: ['-webkit-box', '-ms-flexbox', 'flex'] }]">fullName: {{  fullName }} --- <button @click="changeName">改变姓名</button></div>
    <hr>
    <div v-for="(item, key) in myObject" :key="key ">{{ key }} : {{ item }}</div>
    <div @click="greet">
      name: {{ name }}
    </div>
    <div @click.capture="toAlert1()">
      <div  @click="toAlert2()">
        触发
      </div>
    </div>
    <div @click.capture.ctrl="ctrl">Do something</div>
    {{ msg }}
    <input v-model="msg"/>
    <div>
      <p>Ask a yes/no question:
        <input v-model="question" />
      </p>
      <p>{{ answer }}</p>
    </div>
  </main>
</template>
