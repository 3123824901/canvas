window.onload = function() { //必须写
	var oStart = document.querySelector("#start");
	var oBtn = document.querySelector("input");
	var oMain = document.querySelector("#main");
	var oC = document.querySelector("#c1");
	var gd = oC.getContext("2d");

	function rnd(n, m) {
		return parseInt(Math.random() * (m - n)) + n;
	}

	//开始页面
	oBtn.onclick = function() {
		oStart.style.display = "none";
		oMain.style.display = "block";
		loadImage(arrsource, begin);
	}

	//图片加载
	var arrsource = ["boom.png", "bullet1.png", "enemy1_fly_1.png", "enemy2_fly_1.png", "enemy3_fly_1.png", "飞机爆炸.gif", "我的飞机.gif", "本方飞机爆炸.gif", "大飞机爆炸.gif", "小飞机爆炸.gif", "中飞机爆炸.gif", "大飞机挨打.png", "中飞机挨打.png"]
	var JSON = {};//{"boom":img,"bullet1":img}

	function loadImage(arrSource, success, progress) {
		var loaded = 0;
		for(var i = 0; i < arrSource.length; i++) {
			var oImg = new Image();
			(function(index) {
				oImg.onload = function() {
					loaded++;
					JSON[arrSource[index].split(".")[0]] = this;
					if(arrSource.length == loaded) {
						success && success();
					}
					progress && progress(loaded, arrSource.length);
				}
			})(i)
			oImg.src = './image/' + arrSource[i];
		}
	};
	console.log(JSON);

	//飞机类
	class Plane{
		constructor(x, y, w, h, speed, src1, src2, planeBreath, score) {
			this.x = x;
			this.y = y;
			this.w = w;
			this.h = h;
			this.speed = speed || null;
			this.planeBreath = planeBreath; //飞机生命值
			this.score = score; //飞机分值			
			this.live = 1;//判断是否爆炸
			this.src1 = src1;//正常状态的图片
			this.src2 = src2;//爆炸的图片
			this.timer = null;
			this.isIn();
		}
		draw(gd) {
			if(this.live == 1) {
				this.src = this.src1;
			} else {
				this.src = this.src2;
			}
			gd.save();
			gd.drawImage(JSON[this.src],
				0, 0, this.w, this.h,
				this.x, this.y, this.w, this.h
			);
			gd.restore();
		}
		move() {
			clearInterval(this.timer);
			this.timer = setInterval(function() {
				this.y += this.speed;
			}.bind(this), 16)
		}
		isIn(x, y, z) {
			var a = this.x + this.w / 2 - x;
			var b = this.y + this.h / 2 - y;
			var c = Math.sqrt(a * a + b * b);
			if(c < (this.w / 2 + z / 2)) {
				return true;
			} else {
				return false;
			}
		};
	}
	//我方飞机
	class MyPlane extends Plane {
		constructor(x, y, w, h, speed, src) {
			super(x, y, w, h, speed, src)//ES6继承
			this.planeBreath = 1000;
			this.planeScore = 0; //飞机分值
		}
		draw(gd) {
			super.draw(gd);
		}
		move(gd) {
			gd.clearRect(0, 0, oC.width, oC.height);
			this.draw(gd);
		}

	}
	//子弹类
	class Bullet {
		constructor() {
			this.x = 0;
			this.y = 0;
			this.speed = 10;
			this.timer = null;
			this.move();
		}
		draw(gd) {
			gd.save();
			gd.drawImage(JSON["bullet1"],
				0, 0, 6, 14,
				this.x, this.y, 6, 14
			);
			gd.restore();
		}
		move() {
			clearInterval(this.timer)
			this.timer = setInterval(function() {
				this.y -= this.speed;
			}.bind(this), 50)
		}
	}

	function begin(ev) {
		var arrEnemy = []; //存放敌机
		var arrBullet = []; //保存子弹
		var arrplaneboom = []; //存放爆炸飞机
		var mark = 0; //控制飞机的时间间隔
		var mark1 = 0; //控制大小飞机的顺序
		var mark2 = 0; //控制出子弹的速度
		var scores = 0; //分数
		var sum = 0; //存放歼灭敌机个数
		var bgp = 0; //背景变化初始值    

		//创建我方飞机
		var myPlane = new MyPlane(127, 488, 66, 80, 0, "我的飞机");

		var mytimer = setInterval(function() {
			gd.clearRect(0, 0, oC.width, oC.height);
			//背景变化（注意添加背景时要写成background-image）
			bgp += 1;
			oC.style.backgroundPositionY = bgp + "px";

			//创建子弹类
			mark2++;
			if(mark2 == 10) {
				var bullet = new Bullet();
				bullet.x = myPlane.x + 31;
				bullet.y = myPlane.y - 10;
				arrBullet.push(bullet);
				mark2 = 0;
			}

			//创建敌方飞机
			mark++;
			if(mark == 20) {
				mark1++;
				//中飞机
				if(mark1 % 5 == 0) {
					var enemy_m = new Plane(rnd(0, 274), -164, 46, 60, 2, "enemy3_fly_1", "中飞机爆炸", 600, 1000);
					arrEnemy.push(enemy_m);
				}
				//大飞机
				if(mark1 == 20) {
					var enemy_b = new Plane(rnd(0, 210), -164, 110, 164, 1, "enemy2_fly_1", "大飞机爆炸", 3000, 2000);
					arrEnemy.push(enemy_b);
					mark1 = 0;
				}
				//小飞机
				else {
					var enemy_s = new Plane(rnd(0, 286), -164, 34, 24, 3, "enemy1_fly_1", "小飞机爆炸", 200, 500);
					arrEnemy.push(enemy_s);
				}
				mark = 0;
			}

			//子弹打到敌方飞机
			for(var i = 0; i < arrEnemy.length; i++) {
				for(var j = 0; j < arrBullet.length; j++) {
					if(arrEnemy[i] && arrEnemy[i].isIn(arrBullet[j].x, arrBullet[j].y, 6)) {
						//子弹清除
						clearInterval(arrBullet[j].timer);
						arrBullet.splice(j--, 1);
						//敌机血量减子弹攻击力
						arrEnemy[i].planeBreath = arrEnemy[i].planeBreath - 200;
						//敌机血量为0，敌机图片换为爆炸图片，计分
						if(arrEnemy[i].planeBreath == 0) {
							//实例化敌机爆炸
							var boom = arrEnemy[i];
							boom.live = 2;
							arrplaneboom.push(boom);

							scores += arrEnemy[i].score;
							sum++;
							clearInterval(arrEnemy[i].timer);
							arrEnemy.splice(i--, 1);
						}
					}
				}
			}

			//绘制我方飞机
			myPlane.draw(gd);

			//绘制敌方飞机
			for(var i = 0; i < arrEnemy.length; i++) {
				arrEnemy[i].draw(gd);
				arrEnemy[i].move();
			}
			//绘制子弹
			for(var i = 0; i < arrBullet.length; i++) {
				arrBullet[i].draw(gd);
			}

			//绘制爆炸敌机
			for(let i in arrplaneboom) {
				arrplaneboom[i].draw(gd);
				setTimeout(function() {
					arrplaneboom.shift();//从头部删除，爆炸飞机消失
				}, 400)
			}

			//绘制分数
			gd.font = '700 16px 宋体';
			gd.textAlign = 'left';
			gd.textBaseline = 'center';
			gd.fillText("分数:" + scores, 10, 25);

			//检测我方飞机碰撞
			for(var i in arrEnemy) {
				if(arrEnemy[i] && arrEnemy[i].isIn(myPlane.x + 33, myPlane.y + 40, 30)) {
					clearInterval(mytimer);
					//重新开始按钮
					gd.fillStyle = "#ccc";
					gd.fillRect(60, 200, 200, 120);
					//绘制分数
					gd.fillStyle = "#666";
					gd.font = '700 20px 宋体';
					gd.textAlign = 'left';
					gd.textBaseline = 'center';
					gd.fillText("分 数：" + scores, 100, 230);
					
					//绘制打飞机个数
					gd.fillText("个 数："+sum,100,260);
                    gd.fillRect(110,277,100,34);
                    gd.fillStyle="#fff";
					gd.font="700 20px 宋体";
					gd.fillText("重新开始",120,300);
					oC.onclick=function(ev){
						var x=ev.clientX - oC.offsetLeft-110;
						var y=ev.clientY - oC.offsetTop-277;
						if(x>0&&y>0&&x<100&&y<34){
							location.reload();//重新加载
						};
					};
				}
			}

		}, 30)

		oC.onmousemove = function(ev) {
			var _left = ev.clientX - oC.offsetLeft - myPlane.w / 2;
			var _top = ev.clientY - oC.offsetTop - myPlane.h / 2;
			if(_left < myPlane.w / 2) {
				_left = 0;
			}
			if(_left > oC.width - myPlane.w) {
				_left = oC.width - myPlane.w;
			}
			if(_top < myPlane.h / 2) {
				_top = 0;
			}
			if(_top > oC.height - myPlane.h) {
				_top = oC.height - myPlane.h;
			}
			myPlane.x = _left;
			myPlane.y = _top;
		}
	}

}