function cubeImginit(){
	//这个案例就只是简单地使用three.js的框架了
	//我们先来获取了index.html里面对应的div
	var container = document.getElementById("cubeImg");
	//我们把初始化的运动状态设为真，则会旋转
	animating = true;
	renderer = new THREE.WebGLRenderer({antialias:true}); //抗锯齿

	//一帮把渲染的场景的尺寸设为外围div的长度和宽度，布满整个div，然后把渲染器当作dom元素传给div，创建canvas元素
	renderer.setSize(container.offsetWidth,container.offsetHeight);
	container.appendChild(renderer.domElement);

	//创建了顶级场景对象
	scene = new THREE.Scene();

	//创建我们的相机并且设定了位置
	camera = new THREE.PerspectiveCamera(45,container.offsetWidth/container.offsetHeight,1,4000);
	camera.position.set(0,0,2);

	//创建directional light，设置为颜色为0xfffff，并且射向为1.5 。然后设置它的位置，加入场景中
	var light = new THREE.DirectionalLight(0xffffff,1.5);
	light.position.set(0,0,1);
	scene.add(light);

	//设置我们将载入的纹理图像，简单的使用ImageUtils.loadTexture即可，传入图形的url地址
	//创建材质
	var mapUrl = "images/cubeImg.jpg";
	var map = THREE.ImageUtils.loadTexture(mapUrl);
	var material = new THREE.MeshPhongMaterial({map:map});

	//设置我们的正方体，并且用上面的材质来设置了网格
	var geometry = new THREE.CubeGeometry(5,5,5);
	cube = new THREE.Mesh(geometry,material);

	//改变正方体的旋转属性，让我们能看出是一个立体物体
	cube.rotation.x = Math.PI/5;
	cube.rotation.y = Math.PI/5;
	cube.position.y = 3;

	scene.add(cube);

	//这个run函数是我们的动画函数，而addMouseHandler则是绑定鼠标事件
	run();
	addMouseHandler();
}

function run(){

	renderer.render(scene,camera);
	//旋转我们的立方体
	if(animating){
		cube.rotation.y -= 0.01;
	}
	requestAnimationFrame(run);
}

function addMouseHandler(){
	//获取我们的渲染器对象，然后给它添加mouseup的事件
	var dom = renderer.domElement;
	dom.addEventListener('mouseup',onMouseUp,false);
}
function onMouseUp(event){
	//取消默认的事件绑定，然后来取animating的反值，来运动/暂停物体
	event.preventDefault();
	animating = !animating;
}