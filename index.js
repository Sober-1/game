var wd = 15, //方块宽度
    hg = 15, //方块高度
    tr = 40, //行
    td = 40; //列

    let snake = null;
    let food = null;
    let game = null;
    //方块构造函数
    function Block(x,y,classname){
      this.x = x*wd;
      this.y = y*hg;
      this.class = classname;
      this.element = document.createElement('div');
      this.element.className = this.class
      this.parent = document.getElementById('main')
    }
    //增加方块
    Block.prototype.create = function(){
      this.element.style.position = "absolute";
      this.element.style.width = wd + 'px';
      this.element.style.height = hg + 'px';
      this.element.style.left = this.x + 'px';
      this.element.style.top = this.y + 'px';
      this.element.style.backgroundColor = 'black';
      this.element.style.borderRadius = '50%';
      
      this.parent.appendChild(this.element);
    }
    //删除方块
    Block.prototype.remove = function(){
      this.parent.removeChild(this.element)
    }

    function Snake(){
      this.head = null; //蛇头信息
      this.tail = null; //蛇尾信息
      this.pos = []; //储存蛇身每一个方块的位置
      this.directionNum = {
        left:{x:-1, y:0 },
        right:{x:1,y:0},
        top:{x:0,y:-1},
        down:{x:0,y:1}
      }              //储存蛇的走向
    }
    
    //蛇的初始化
    Snake.prototype.init = function(){
      //初始化蛇头
      let snakeHead = new Block(2,0,'snakeHead')
      snakeHead.create();
      this.head = snakeHead;
      this.pos.push([2,0]);
      //初始化蛇身
      let snakeBody = new Block(1,0,'snakeBody')
      snakeBody.create();
      this.pos.push([1,0]);
      //初始化蛇尾
      let snakeTail = new Block(0,0,'snakeTail')
      snakeTail.create();
      this.tail = snakeTail;
      this.pos.push([0,0]);
      //形成链表结构
      snakeHead.last = null;
      snakeHead.next = snakeBody;

      snakeBody.last = snakeHead;
      snakeBody.next = snakeTail;

      snakeTail.last = snakeBody;
      snakeTail.next = null;
      //给蛇添加默认行走的方向
      this.direction = this.directionNum.right;
    }

    //获取蛇头下一个位置对应的元素  根据不同元素做不同的事情
    Snake.prototype.getNextPos = function(){
      let nextPos = [  //蛇头要走的下一个点的坐标
        this.head.x/wd + this.direction.x,
        this.head.y/hg + this.direction.y
      ]
      //下个点如果是自己  代表撞到自己身体 游戏结束
      var selfs = false;
      this.pos.forEach(function(value){
        if(value[0]==nextPos[0] && value[1]==nextPos[1]){
          selfs = true;
        }
      });
      if(selfs){
        console.log('zhuangdaozijile')
        this.peng.die.call(this);
        return;
      }
      //下个点是边缘  代表撞墙  游戏结束
      if(nextPos[0]<0||nextPos[0]>td-1||nextPos[1]<0||nextPos[1]>tr-1){
        this.peng.die.call(this);
        return;
      }
      //下个点是食物  吃掉食物  继续前进
      if(food && food.pos[0]===nextPos[0] && food.pos[1]===nextPos[1]){
        console.log('撞到食物了')
        this.peng.eat.call(this);
        return;
      }
      //下个点什么都没有  继续前进
      this.peng.move.call(this);
    };

    //处理碰撞后的函数
    Snake.prototype.peng = {
      move:function(format){//参数决定要不要删除蛇尾  传参表示要吃 不传表示不吃
        let newBody = new Block(this.head.x/wd,this.head.y/hg,'snakeBody1');
        //更新链表关系
        newBody.next = this.head.next;
        newBody.next.last = newBody;
        newBody.last = null;
        this.head.remove();//把旧蛇头删除
        newBody.create();
        //创建新蛇头(位置为蛇头下一个走到的点)
        let newHead = new Block(this.head.x/wd + this.direction.x,this.head.y/hg + this.direction.y,'newHead');
        newHead.next = newBody;
        newHead.last = null;
        newBody.last = newHead;
        newHead.create();
        //蛇身的坐标也要更新
        this.pos.splice(0,0,[this.head.x/wd + this.direction.x,this.head.y + this.direction.y]);
        this.head = newHead;
        if(!format){
          this.tail.remove();
          this.tail = this.tail.last;
          this.pos.pop()
        }
      },
      eat:function(){
        this.peng.move.call(this,true);
        //再次生成食物
        createFood();
        game.score++;//得分增加
      },
      die:function(){
        game.over();
      }
    }

    //初始化蛇
    snake = new Snake();

    //创建食物
    function createFood(){
      let x = null;
      let y = null;
      let include = true; //true表示食物坐标在蛇身上 false表示不在蛇身上
      while(include){
        x = Math.round(Math.random()*(td-1));
        y = Math.round(Math.random()*(tr-1));

        snake.pos.forEach(value => {
          if(x !== value[0] && y !== value[1]){//此时生成的food不在边框上
            include = false;
          }
        });
      }
      //生成food
      food = new Block(x,y,'food');
      food.pos = [x,y];//存储生成食物的坐标 跟蛇头走的点做对比
      let foodDom = document.getElementsByClassName('food')[0];
      if(foodDom){
        foodDom.style.left = x*wd + 'px';
        foodDom.style.top = y*hg + 'px';
      }else{
        food.create();
      }
    }

    //创建游戏逻辑
    function Game(){
      this.timer = null;
      this.score = 0;
    }
    Game.prototype.init = function(){
      snake.init();
      createFood();
      document.onkeydown = function(event){
        if(event.which === 37 && snake.direction != snake.directionNum.right){
          snake.direction = snake.directionNum.left
        }else if(event.which === 38 && snake.direction != snake.directionNum.down){
          snake.direction = snake.directionNum.top
        }else if(event.which === 39 && snake.direction != snake.directionNum.left){
          snake.direction = snake.directionNum.right
        }else if(event.which === 40 && snake.direction != snake.directionNum.top){
          snake.direction = snake.directionNum.down
        }
      }
      this.started();
    }
    Game.prototype.started = function(){
      //开始游戏
      this.timer = setInterval(function(){
        //获取下一个点
        snake.getNextPos();
      },200)
    }
    Game.prototype.clear = function(){
      clearInterval(this.timer)
    }
    Game.prototype.over = function(){
      clearInterval(this.timer);
      alert('你的得分为: ' + this.score);
      main.innerHTML = '';
      snake = new Snake();
      game = new Game();
      main.style.display = 'none';
      start.style.display = 'block';
     
    }
    game = new Game();

    //点击游戏开始
    let start = document.getElementsByClassName('start')[0];
    let main = document.getElementById('main');
    let end = document.getElementsByClassName('end')[0];
    start.onclick = function(){
      start.style.display = 'none';
      main.style.display = 'block';
      game.init();
    }
    main.onclick = function(){
      game.clear();
      end.style.display = 'block';
      end.style.zIndex = '9';
    }
    
    end.onclick = function(){
      end.style.display = 'none';
      game.started();
    }