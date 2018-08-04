function $(selector){
  return document.querySelector(selector)
}
function $$(selectorAll){
  return document.querySelectorAll(selectorAll)
}

// 封装获取音乐列表的函数，并将ajax获取数据的代码放置进入该函数
function getMusicList(callback){
  //ajax获取数据
  var xhr = new XMLHttpRequest()
  xhr.open('GET','/music.json',true)
  xhr.onload = function(){
    if((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304){
      // console.log(JSON.parse(this.responseText))
      callback(JSON.parse(this.responseText))
    }else{
      console.log('获取数据失败')
    }
  }
  xhr.onerror = function(){
    console.log('网络异常')
  }
  xhr.send()
}


var musicList = []  //定义音乐列表为空
var currentIndex = 0  // 定义音乐列表的序号currentIndex
var audio = new Audio()  //定义音乐对象audio
var musicListContainer = $('.musicbox .list')
audio.autoplay = true   //设置audio自动播放

getMusicList(function(list){
  musicList = list
  setPlaylist(list)  //获取歌曲列表 传值进setPlaylist函数
  loadMusic(list[currentIndex]) //ajax获取到的数据，使用loadMusic函数通过列表序号currentIndex加载到具体的某个音乐
})

//定义loadMusic函数，获取音乐的src，然后播放
function loadMusic(musicObj){
  console.log('begin play',musicObj)
  $('.musicbox .title').innerText = musicObj.title  //修改音乐名
  $('.musicbox .author').innerText = musicObj.author  //修改歌手名
  $('.cover').style.backgroundImage = 'url(' + musicObj.img + ')'  //修改背景图片
  audio.src = musicObj.src  //音乐audio的src为musicObj对象的src
  for(var i = 0; i < musicListContainer.children.length; i++){
    musicListContainer.children[i].classList.remove('playing')
  }
  musicListContainer.children[currentIndex].classList.add('playing')
}

//监听事件timeupdate，当音乐播放时，持续输出currentTime
audio.ontimeupdate = function(){
  console.log(this.currentTime) //这里的this即是audio
  //设置进度条，即.musicbox .progress-now的样式宽度百分比为当前时间除以总时间的百分比
  $('.musicbox .progress-now').style.width = (this.currentTime/this.duration)*100 + '%'
}

audio.onplay = function(){
  clock = setInterval(function(){    //设置歌曲时间显示，使用setInterval让进度条变得更加精准
    var min = Math.floor(audio.currentTime/60)
    var sec = Math.floor(audio.currentTime)%60 + ''   //sec转换成字符串，便于下面进行判断
    sec = sec.length === 2 ? sec : '0' + sec  //三元运算判断秒数长度，如果个位秒数，在前加0
    $('.musicbox .time').innerText = min + ':' + sec
  },1000)
}

audio.onpause = function(){
  clearInterval(clock)  //当pause暂停/或下一曲时触发clearInterval
}

audio.onended = function(){  //监听单曲播放完毕之后的事件 即和下一曲按钮是一样的
  currentIndex = (++currentIndex)%musicList.length  //使音乐永远循环列表的表达式
  loadMusic(musicList[currentIndex])  //播放下一曲
}


var nowVol = audio.volume  //先定义一个变量nowVol表示当前音量
// 设置调整音量大小事件
// 音量提升
$('.musicbox .up').onclick = function(){
  if(audio.volume < 1){
    audio.volume = audio.volume + 0.2
    console.log('当前音量: ' + audio.volume)
    nowVol = audio.volume  //返还值给当前音量，便于静音恢复的时候调用
    $('.musicbox .volume').querySelector('.fa').classList.remove('fa-volume-off')
    $('.musicbox .volume').querySelector('.fa').classList.add('fa-volume-up')
    //当音量从最小升高时，静音icon会消失
  }else{
    console.log('当前音量已达最大')
  }
}

// 音量降低
$('.musicbox .down').onclick = function(){
  if(audio.volume > 0.4){
    audio.volume = audio.volume - 0.2
    console.log('当前音量: ' + audio.volume)
    nowVol = audio.volume  //返还值给当前音量，便于静音恢复的时候调用
  }else{
    audio.volume = audio.volume - 0.20000000000000007
    console.log(audio.volume)
    console.log('当前音量已达最小')  //当音量达到最小时，静音icon也会出现
    $('.musicbox .volume').querySelector('.fa').classList.remove('fa-volume-up')
    $('.musicbox .volume').querySelector('.fa').classList.add('fa-volume-off')
  }
}

// 设置静音按钮事件
$('.musicbox .volume').onclick = function(){
  // 判断，如果是非静音状态，变为静音
  if(audio.volume !== 0){
    audio.volume = 0
    this.querySelector('.fa').classList.remove('fa-volume-up')
    this.querySelector('.fa').classList.add('fa-volume-off')
    console.log('当前音量: ' + audio.volume)
  }else{
    // 如果是静音状态，恢复之前的音量
    audio.volume = nowVol
    this.querySelector('.fa').classList.remove('fa-volume-off')
    this.querySelector('.fa').classList.add('fa-volume-up')
    console.log('当前音量: ' + audio.volume)
  }
}


//设置播放器按钮事件
$('.musicbox .play').onclick = function(){
  //判断，如果是暂停状态
  if(audio.paused){
    audio.play()
    this.querySelector('.fa').classList.remove('fa-play')  //去除play播放图标样式
    this.querySelector('.fa').classList.add('fa-pause')  //添加pause暂停图标样式
  }else{
    audio.pause()
    this.querySelector('.fa').classList.remove('fa-pause')  //去除pause暂停图标样式
    this.querySelector('.fa').classList.add('fa-play')  //添加play播放图标样式
  }
}

//设置下一曲按钮事件
$('.musicbox .forward').onclick = function(){
  currentIndex = (++currentIndex)%musicList.length  //使音乐永远循环列表的表达式
  console.log(currentIndex)
  loadMusic(musicList[currentIndex])  //播放下一曲
}

//设置上一曲按钮事件
$('.musicbox .back').onclick = function(){
  currentIndex = (musicList.length + --currentIndex)%musicList.length  //使音乐永远循环列表的表达式
  console.log(currentIndex)
  loadMusic(musicList[currentIndex])  //播放下一曲
}

//拖动进度条
$('.musicbox .bar').onclick = function(e){
  console.log(e)
  var percent = e.offsetX / parseInt(getComputedStyle(this).width)  //点击bar进度条获取一个offsetX的值，和总长相除得到一个百分比
  console.log(percent)
  audio.currentTime = audio.duration * percent  //拖动进度条音乐相应的变成该百分比位置的音乐
}

//歌曲列表 使用代理事件 让新生成的li标签也能够捕获到事件
musicListContainer.onclick = function(e){
  if(e.target.tagName.toLowerCase() === 'li'){
    for(var i = 0; i < this.children.length; i++){
      if(this.children[i] === e.target){
        currentIndex = i
      }
    }
    console.log(currentIndex)
    loadMusic(musicList[currentIndex])
  }
}

//列表显示内容函数
function setPlaylist(musiclist){
  var container = document.createDocumentFragment() //存在内存dom片段中的方法
  musiclist.forEach(function(musicObj){
    var node = document.createElement('li')  //创建一个li标签
    node.innerText = musicObj.author + ' - ' + musicObj.title  //拼接歌曲列表内容
    console.log(node)
    container.appendChild(node)
  })
  musicListContainer.appendChild(container)
}
