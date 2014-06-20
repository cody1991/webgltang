//EarthApp的构造器
EarthApp = function(){
	Sim.App.call(this);
}

//Sim.js的Appaction类，封装了所有的Three.js中建立或者删除操作的代码
//比如创建渲染器、顶层场景和相机，同时也加入了处理部分DOM事件
//也可以控制画布的缩放、鼠标输入和其他事件
EarthApp.prototype = new Sim.App();

//进行EarthApp的初始化
EarthApp.prototype.init = function(param){
	Sim.App.prototype.init.call(this,param);

	//这是我们的地球对象
	//之后初始化并且把它添加到EarthApp中
	var earth = new Earth();
	earth.init();
	this.addObject(earth);

	//接下来我们会创建一个代表太阳光源的点光源point light
	var sun = new Sun();
	sun.init();
	this.addObject(sun);

	//移动相机的位置，否则看不到月球
	this.camera.position.z += 0.5;

	//创建星空背景
	var stars = new Stars();
	stars.init(300);
	this.addObject(stars);

	//创建场景漫游，你可以通过鼠标来放大缩小，移动物体和旋转视角
	this.createCameraControls();

}

//Earth的构造器
Earth = function(){
	Sim.Object.call(this);
}

//Sim.js的Object类是大部分应用中的对象基类负责管理某个由应用层自定义的对象
//还能处理一些Three.js中基本操作
//例如增加/移除物体等等
Earth.prototype = new Sim.Object();

//进行Earth的初始化
Earth.prototype.init = function()
{
	//earth因为包括了地球本事和云层，所以设为一个组
	var earthGroup = new THREE.Object3D();


	//把对象返回给Earth对象
	this.setObject3D(earthGroup);

	//下面两个函数分别创建地球和云层
	this.createEarth();
	this.createCloud();

	//创建月球
	this.createMoon();
}
//开始创建地球
Earth.prototype.createEarth = function(){
	//设置地球的纹理图片
	//设置地球的纹理，载入位图
	//.loadTexture(url)
	//url -- the url of the texture

	//这张图提供了最基本的像素颜色
	var surfaceMap = THREE.ImageUtils.loadTexture("images/earth_surface.jpg");
	//这张图提供了法线贴图，决定了光照在网格表面时的亮度，实现崎岖不平的地球表面效果
	var normalMap = THREE.ImageUtils.loadTexture("images/earth_normal.jpg");
	//这张图是高光贴图，决定网格表面反光程度和反光量
	var specularMap = THREE.ImageUtils.loadTexture("images/earth_specular.jpg");

	//ShaderUtils这个工具类包含了一个预置的着色器程序库，设定为 normal 则会使用它的法线贴图着色器
	var shader = THREE.ShaderUtils.lib["normal"];

	// uniform是对于每个定点都是相同的一个常量，例如世界空间的转换矩阵和投影矩阵
	//（ Support merging and cloning of uniform variables）
	var uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	//法线贴图着色器至少需要一张法线贴图纹理来计算凹凸值，我们在下面提供了
	//另外也提供了颜色贴图和高光贴图
	uniforms["tNormal"].texture = normalMap;   //法线贴图
	uniforms["tDiffuse"].texture = surfaceMap;  //颜色贴图
	uniforms["tSpecular"].texture = specularMap; //高亮贴图

	uniforms["enableDiffuse"].value = true;  //设为true告诉它需要用到颜色贴图
	uniforms["enableSpecular"].value = true; //设为true告诉它需要用到高亮贴图


	//ShaderMaterial(parameters)
	//parameters -- An object containing various parameters setting up shaders and their uniforms.
	
	//.uniforms
	//Uniforms defined inside GLSL shader code.
	//.fragmentShader
	//Fragment shader GLSL code. This is the actual code for the shader. 
	//.vertexShader
	//Vertex shader GLSL code. This is the actual code for the shader. 
	//.lights
	//传入光照
	var shaderMaterial = new THREE.ShaderMaterial({
		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader,
		uniforms: uniforms,
		lights: true
	});

	//创建一个球体
	//SphereGeometry(radius, widthSegments, heightSegments)
	//radius — sphere radius. Default is 50.
    //widthSegments — number of horizontal segments. Minimum value is 3, and the default is 8.
    //heightSegments — number of vertical segments. Minimum value is 2, and the default is 6.
    //可以提高widthSegments heightSegments让其看起来更加逼真更加像球体，我们取64
	var earthGeometry = new THREE.SphereGeometry(1,64,64);

	//为着色器计算切线
	earthGeometry.computeTangents();

	//创建网格并且把地球和纹理材料传入
	var earthMesh = new THREE.Mesh(earthGeometry,shaderMaterial);

	//设定地球的倾斜角，因为众所周知地球是有个倾斜角的
	earthMesh.rotation.z = Earth.TILT;
	//把得到的这个网格设定给Earth对象

	//添加到群组
	this.object3D.add(earthMesh);
	//把earthMesh保存起来
	this.earthMesh = earthMesh;
}
	
Earth.prototype.createCloud = function(){
	//设置云层的纹理材料 不再赘述
	//MeshLamberMaterial : A material for non-shiny (Lambertian) surfaces, evaluated per vertex.
	//云层使用透明纹理，而MeshLamberMaterial会使得它明暗成都一样，因为云层能反光
	var cloudMap = THREE.ImageUtils.loadTexture("images/earth_cloud.png");
	var cloudMaterial = new THREE.MeshLambertMaterial({color:0xffffff,map:cloudMap,transparent:true});

	//创建云层球体并且设置它的网格
	var cloudGeometry = new THREE.SphereGeometry(Earth.Cloud_SCALE,64,64);
	cloudMesh = new THREE.Mesh(cloudGeometry,cloudMaterial);
	//设置和地球一样的倾斜角
	cloudMesh.rotation.z = Earth.TILT;

	//添加到群组
	this.object3D.add(cloudMesh);
	//把cloudMesh保存起来
	this.cloudMesh = cloudMesh;
}

Earth.prototype.createMoon = function(){
	//创建moon对象并且初始化后添加到地球群组中，作为子对象
	var moon = new Moon;
	moon.init();
	this.addChild(moon);
}

Moon = function(){
	Sim.Object.call(this);
}

Moon.prototype = new Sim.Object();

Moon.prototype.init = function(){
	var moonMap = "images/moon.jpg";
	var moonGeometry = new THREE.SphereGeometry(Moon.SIZE_IN_EARTH,64,64); //设定一个地月大小比例
	var texture = THREE.ImageUtils.loadTexture(moonMap);
	//.ambient 周围颜色
	//Ambient color of the material, multiplied by the color of the AmbientLight. Default is white.
	var material = new THREE.MeshPhongMaterial({map:texture,ambient:0x888888});
	var mesh = new THREE.Mesh(moonGeometry,material);

	//计算地月的距离并且放置好月亮的初始位置
	var distance = Moon.DISTANCE_FROM_EARTH/Earth.RADIUS;
	mesh.position.set(Math.sqrt(distance/2),0,-Math.sqrt(distance/2));

	//旋转月球使得它始终只有一个面对着地球
	mesh.rotation.y = Math.PI;

	//创建群组的原因就是因为如果只是旋转单个网格的话，月球只会在原地自转，比如地球这样
	//而把月球网格设定为一个群主的话，他们就会集体绕着设定好的轨道旋转
	var moonGroup = new THREE.Object3D();
	moonGroup.add(mesh);

	//有个黄道面，需要倾斜
	moonGroup.rotation.x = Moon.INCLINATION;

	this.setObject3D(moonGroup);
	this.moonMesh = mesh;
}

//.update()会更新渲染运动的地球的信息，下面函数使地球绕着Y轴旋转，即众所周知的地球自转
Earth.prototype.update = function(){
	this.earthMesh.rotation.y += Earth.ROTATION_Y;
	this.cloudMesh.rotation.y += Earth.CLOUD_ROTATION_Y;
	Sim.Object.prototype.update.call(this);
}
Moon.prototype.update = function(){
	//这个是月球的运动轨迹，算好和地球的日期比来确定转速
	this.object3D.rotation.y += (Earth.ROTATION_Y/Moon.PERIOD);
}
//设定地球群组的私有变量：地球和云层的自转速度以及倾斜角
Earth.ROTATION_Y = 0.005;    //别人说地球转太快了呀...改慢点
Earth.TILT = 0.41;
Earth.RADIUS = 6371;
Earth.Cloud_SCALE = 1.005; //略比地球大
Earth.CLOUD_ROTATION_Y = Earth.ROTATION_Y * 0.95  //转的速度比地球慢

Moon.DISTANCE_FROM_EARTH = 356400;
Moon.PERIOD = 28;
Moon.EXAGGERATE_FACTOR = 1.2;
Moon.INCLINATION = 0.089;
Moon.SIZE_IN_EARTH = 1/3.7*Moon.EXAGGERATE_FACTOR;

//下面是创建Sun对象，模拟光源
Sun = function(){
	Sim.Object.call(this);
}
Sun.prototype = new Sim.Object();
Sun.prototype.init = function(){
	//创建一个点光源，它的颜色为白光，强度2，距离为100
	//PointLight(hex, intensity, distance)
	//hex — Numeric value of the RGB component of the color. 
	//intensity — Numeric value of the light's strength/intensity. 
	//distance -- The distance of the light where the intensity is 0. 
	//When distance is 0, then the distance is endless.
	var light = new THREE.PointLight(0xffffff,2,100);
	//放置light的位置
	light.position.set(-10,0,20);

	//最后把光源添加到Sun对象，完全太阳对象的初始化
	this.setObject3D(light);
}


Stars = function(){
	Sim.Object.call(this);
}
Stars.prototype = new Sim.Object();
Stars.prototype.init = function(minDistance){
	//创建星星群
	var StarsGroup = new THREE.Object3D();

	var i;
	//空的THREE.Geometry用来装载我们生成的星星粒子的顶点坐标
	var startsGeometry = new THREE.Geometry();

	for(i = 0; i<Stars.NVERTICES;i++) //NVERTICES是星星的数量
	{
		var vector = new THREE.Vector3(
				(Math.random()*2-1) * minDistance,
				(Math.random()*2-1) * minDistance,
				(Math.random()*2-1) * minDistance
			);
		//确保位置不会太近 而使得这些星星抢占了月球和地球这两个主角
		if(vector.length() < minDistance){
			vector = vector.setLength(minDistance);
		}
		//符合要求的放进startsGeometry对象中
		startsGeometry.vertices.push(new THREE.Vertex(vector));
	}

	var startsMaterials = [];
	for(i = 0; i < Stars.NMATERIALS; i++)//NMATERIALS的材质数量
	{
		//ParticleBasicMaterial这个对象用来定义粒子系统的点的尺寸和颜色
		//我们为恒星的颜色和尺寸定义了一个取值范围来模拟不同量级的恒星
		//sizeAttenuation:false;这个告诉计算机移动时不需要缩放这些例子
		//它们足够远，相机的移动产生不了太大的影响
		startsMaterials.push(
				new THREE.ParticleBasicMaterial({
					color:0x101010*(i+1),
					size:i%2+1,
					sizeAttenuation:false
				})
			);
	}
	for(i = 0;i<Stars.NPARTICLESYSTEMS;i++)//创建NPARTICLESYSTEMS个例子系统
										   //以圆形环绕方式散步开来
										   //从而布满整个天空
	{
		var stars = new THREE.ParticleSystem(startsGeometry,startsMaterials[i%Stars.NMATERIALS]);

		//旋转星星
		stars.rotation.y = i/(Math.PI * 2);

		StarsGroup.add(stars);

		this.setObject3D(StarsGroup);
	}
}

Stars.NVERTICES = 500;
Stars.NMATERIALS = 30;
Stars.NPARTICLESYSTEMS = 24;

EarthApp.prototype.createCameraControls = function()
{
	//TrackballControls 漫游控制，传入相机和HTML DOM元素
	var controls = new THREE.TrackballControls( this.camera, this.renderer.domElement );
	var radius = EarthApp.CAMERA_RADIUS;
	
	controls.rotateSpeed = EarthApp.ROTATE_SPEED;    //旋转速度
	controls.zoomSpeed = EarthApp.ZOOM_SPEED;		 //缩放场景的速度
	controls.panSpeed = EarthApp.PAN_SPEED;          //移动对象的速度
	controls.dynamicDampingFactor = EarthApp.DAMPING_FACTOR;  //抑制因素
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = false;

	controls.minDistance = radius * EarthApp.MIN_DISTANCE_FACTOR;
	controls.maxDistance = radius * EarthApp.MAX_DISTANCE_FACTOR;

	this.controls = controls;
}

EarthApp.prototype.update = function()
{
	this.controls.update();
    Sim.App.prototype.update.call(this);
}

EarthApp.CAMERA_RADIUS = 20;
EarthApp.MIN_DISTANCE_FACTOR = 0.1;
EarthApp.MAX_DISTANCE_FACTOR = 20;
EarthApp.ROTATE_SPEED = 1.0;
EarthApp.ZOOM_SPEED = 3;
EarthApp.PAN_SPEED = 0.2;
EarthApp.DAMPING_FACTOR = 0.3;