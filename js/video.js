//创建我们的视频纹理应用
VideoApp = function()
{
	Sim.App.call(this);
}


VideoApp.prototype = new Sim.App();


VideoApp.prototype.init = function(param)
{
	Sim.App.prototype.init.call(this, param);
	
    //设置光源为directional light，并且设置光源的位置，最后加入到场景中
	var light = new THREE.DirectionalLight( 0xffffff, 1);
	light.position.set(0, 0, 1);
	this.scene.add(light);
	
	//设置我们相机的位置，以便更好地看到立方体
	this.camera.position.set(0, 0, 6.67);

	//调用创建我们立方体播放器的函数
	this.createPlayers();
	//调用场景漫游的函数
	this.createCameraControls();
}


VideoApp.prototype.createPlayers = function()
{
	//获取我们的视频文件
	var video1 = document.getElementById( 'video1' );
	//创建我们的播放器
    var player = new VideoPlayer();
    //传入视频代表的HTML元素参数
    player.init({ video : video1, animateRollover : true });
    //把我们的视频对象传入到我们的videoApp中，并且把我们的视频对象放在三维坐标(0,0,0)中
    this.addObject(player);
    player.setPosition(0, 0, 0);
    //这里我们需要稍微地调整player状态，旋转Math.PI/9的角度，否则立方体正对着我们，只能看到一个长方行
    player.object3D.rotation.x = Math.PI / 9;

	
    
}

VideoApp.prototype.update = function()
{
	Sim.App.prototype.update.call(this);
}
//这是我们立方体播放器的构造函数
VideoPlayer = function()
{
	Sim.Object.call(this);
}

VideoPlayer.prototype = new Sim.Object();

VideoPlayer.prototype.init = function(param)
{
	//获取视频HTML对象并且设定立方体的大小
	var video = param.video || "";
	var size =  2;
	this.animateRollover = param.animateRollover;
	
	//这里就是设置视频纹理的地方了
	var texture = new THREE.Texture(video);
	//minFilter,magFilter，这是多级渐进纹理过滤，在缩放时消除锯齿的技术
	texture.minFilter = THREE.LinearFilter;
	texture.magFilter = THREE.LinearFilter;

	
	var group = new THREE.Object3D;
	//创建出来我们的立方体，并且把上面设定好的视频纹理传给材质对象，最后设定好了我们的网格
    var geometry = new THREE.CubeGeometry(size+1.5, size+0.5, size+0.5);
    var material = new THREE.MeshLambertMaterial( { map:texture } );
    var mesh = new THREE.Mesh( geometry, material ); 
    group.add(mesh);
    

    this.setObject3D(group);
    this.video = video;
    this.texture = texture;

    //playing代表的是:视频是否播放的flag,而overCursor则可以设定鼠标在立方体上面的时候的鼠标箭头形态
    this.playing = true;
    this.overCursor = 'pointer';
	
	//下面是设置我们的播放器的动画
    this.animator = new Sim.KeyFrameAnimator;
    this.animator.init({ 
    	interps:
    		[ 
    	    { 
    	    	keys:  VideoPlayer.rotationKeys, 
    	    	values:VideoPlayer.rotationValues, 
    	    	target:this.object3D.rotation } 
    		],
    	loop: false,
    	duration:VideoPlayer.animation_time
    });

    this.animator.subscribe("complete", this, this.onAnimationComplete);
    this.addChild(this.animator); 
	this.animating = false;
}

VideoPlayer.prototype.update = function()
{
	if (this.playing)
	{
		//HAVE_ENOUGH_DATA代表着视频的数据是否足够了，只有足够的情况下才会进行纹理的更新
		if (this.video.readyState === this.video.HAVE_ENOUGH_DATA)
		{
			if (this.texture)
			{
				this.texture.needsUpdate = true;
			}
		}
	}
	
	Sim.Object.prototype.update.call(this);
}

//绑定了鼠标在物体上面的时候的事件
VideoPlayer.prototype.handleMouseOver = function()
{
	//鼠标在物体上面的时候，如果无情不再运动则开始动画
	if (this.animateRollover && !this.animating)
	{
		this.animator.start();
		this.publish("over", this.id);
		this.animating = true;
	}
}
//动画结束的时候设置animating为假，代表动画结束
VideoPlayer.prototype.onAnimationComplete = function()
{
	this.animating = false;
}
//绑定鼠标点击物体时候的事件
VideoPlayer.prototype.handleMouseUp = function()
{
	
	this.togglePlay();
}
//分别切换鼠标点击的时候视频的暂停/播放状态
VideoPlayer.prototype.togglePlay = function()
{
	this.playing = !this.playing;
	if (this.playing)
	{
		this.video.play();
	}
	else
	{
		this.video.pause();
	}		
}

//设置立方体旋转的时候每个帧对应的旋转帧值
VideoPlayer.rotationKeys = [0, 0.25 , 0.5, 0.75 ,1];
VideoPlayer.rotationValues = [ 
								{ y: Math.PI / 2 }, 
                                { y: Math.PI},
                                { y: Math.PI / 2 },
                                { y: Math.PI * 3 / 2},
                                { y: Math.PI * 2},
                                ];

VideoPlayer.animation_time = 750;


VideoApp.prototype.createCameraControls = function()
{
	//TrackballControls 漫游控制，传入相机和HTML DOM元素
	var controls = new THREE.TrackballControls( this.camera, this.renderer.domElement );
	var radius = VideoApp.CAMERA_RADIUS;
	
	controls.rotateSpeed = VideoApp.ROTATE_SPEED;    //旋转速度
	controls.zoomSpeed = VideoApp.ZOOM_SPEED;		 //缩放场景的速度
	controls.panSpeed = VideoApp.PAN_SPEED;          //移动对象的速度
	controls.dynamicDampingFactor = VideoApp.DAMPING_FACTOR;  //抑制因素
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = false;

	controls.minDistance = radius * VideoApp.MIN_DISTANCE_FACTOR;
	controls.maxDistance = radius * VideoApp.MAX_DISTANCE_FACTOR;

	this.controls = controls;
}

VideoApp.prototype.update = function()
{
	this.controls.update();
    Sim.App.prototype.update.call(this);
}

VideoApp.CAMERA_RADIUS = 20;
VideoApp.MIN_DISTANCE_FACTOR = 0.1;
VideoApp.MAX_DISTANCE_FACTOR = 20;
VideoApp.ROTATE_SPEED = 1.0;
VideoApp.ZOOM_SPEED = 3;
VideoApp.PAN_SPEED = 0.2;
VideoApp.DAMPING_FACTOR = 0.3;