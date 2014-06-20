//这是我们的文字应用的构造函数
TextApp = function()
{
	Sim.App.call(this);
}
TextApp.prototype = new Sim.App();
TextApp.prototype.init = function(param)
{
	
	Sim.App.prototype.init.call(this, param);
	
	//我们在下面添加了两中光源，让文字的色彩更加好看绚丽。
	var pointLight = new THREE.PointLight( 0xffd400, 1 );
	pointLight.position.set( 20, 20, 100 );
	this.scene.add( pointLight );
	var spotLight = new THREE.SpotLight( 0xf47920, 1 );
	spotLight.position.set( 100, 100, 100 );
	this.scene.add( spotLight );
	
	//这里设置相机的位置和它的朝向
	this.camera.position.set(0, 21, 48);
	this.camera.lookAt(new THREE.Vector3);

	//创建我们的文字对象
	this.createTextObjects();
	//这个代表着我们的地板
	this.createFloor();

	//mouseDown 一开始设为假 表示我们没有点击鼠标来旋转字体
	this.mouseDown = false;
}

TextApp.prototype.createTextObjects = function()
{
	//创建了我们的字体对象，并且把它的值设为Hi WebGL
    var text = new TextObject();
    text.init('Hi WebGL');
    this.addObject(text);
    this.text1 = text;

    //再次创建文字对象，值也为Hi WebGL，这个主要是用来设置倒影的
    var text = new TextObject();
    text.init('Hi WebGL');
    this.addObject(text);

    //它在x轴方向旋转了180° 而在y轴方向旋转了360° 
	text.object3D.rotation.x = Math.PI;
	text.object3D.rotation.y = Math.PI * 2;

	//TEXT_DEPTH则是文字的深度,表示它们是有景深效果的3D文字
	text.mesh.position.z = -TextApp.TEXT_DEPTH;
	//把倒影往下移动
	text.setPosition(0, -1, 0);
    this.text2 = text;
}

TextApp.prototype.createFloor = function()
{
	//这个是一个平面的图形创建
	//然后我们设置了它的颜色，高亮等等的属性，这只是要做出一个透明的地板对象
	var plane = new THREE.Mesh
								( 
									new THREE.PlaneGeometry( 55, 50 ), 
									new THREE.MeshPhongMaterial( 
										{ 
											color: 0x333333, 
											specular:0xff0000, 
											shininess:100, 
											opacity: 0.5, 
											transparent: true 
										} 
									) 
								);
	//旋转了地板使它处于水平状态，然后调整了它的z轴位置
	plane.rotation.x = -Math.PI/2;
	plane.position.z = 3;
	this.scene.add( plane );
}

TextApp.prototype.update = function()
{
	//鼠标没有点击的情况下不断地进行旋转
	if (!this.mouseDown){
		this.root.rotation.y += 0.005;
	}	
}

TextApp.prototype.handleMouseDown = function(x, y, point, normal)
{
	//鼠标点击的时候切换旋转/运动状态
	this.mouseDown = !this.mouseDown;
}

TextApp.prototype.handleMouseMove = function(x, y, point, normal)
{
	if (this.mouseDown)
	{
		this.root.rotation.y += 0;
	}
}
TextApp.TEXT_DEPTH = 2;
TextApp.TEXT_SIZE = 8;


TextObject = function()
{
	Sim.Object.call(this);
}

TextObject.prototype = new Sim.Object();

TextObject.prototype.init = function(str)
{
    
    var textGroup = new THREE.Object3D();
    this.setObject3D(textGroup);
    this.str = str;
    this.createTextMesh();
}

TextObject.prototype.createTextMesh = function()
{
	//这里主要就是设置文字的各种属性了
	var textMesh, 
		textGeo, 
		faceMaterial, 
		textMaterialFront, 
		textMaterialSide;

	var text = this.str;
	var height = TextApp.TEXT_DEPTH; 
	var size = TextApp.TEXT_SIZE;
	var font = "droid sans";
	var weight = "bold";
	var style = "normal";

	var faceMaterial = new THREE.MeshFaceMaterial();
	var textMaterialFront = new THREE.MeshPhongMaterial( 
			{ color: 0xffffff, shading: THREE.FlatShading } );
	
	//传入上面的各种参数来创建文字
	var textGeometry = new THREE.TextGeometry( text, 
			{ 
				size: size, 
				height: height, 
				font: font, 
				weight: weight, 
				style: style,
				material: 0,
				extrudeMaterial: 0
			});

	textGeometry.materials = [ textMaterialFront ];
	textGeometry.computeBoundingBox();
	textGeometry.computeVertexNormals();

	textMesh = new THREE.Mesh( textGeometry, faceMaterial );
	var centerOffset = -0.5 * ( textGeometry.boundingBox.x[ 1 ] - 
			textGeometry.boundingBox.x[ 0 ] );
	textMesh.position.x = centerOffset;
	this.object3D.add(textMesh);
	this.mesh = textMesh;
}

TextObject.prototype.update = function()
{
	Sim.Object.prototype.update.call(this);
}