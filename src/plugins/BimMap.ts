import Tool from './Tools';
import config from './config'

declare let THREE: any;
declare let BimfaceSDKLoader: any;
declare let BimfaceSDKLoaderConfig: any;
declare let Glodon: any;
declare let BimfaceEnvOption: any;

const DEFAULT_ROBOT_NAME = "car1";

export class BimMap {

    mDomId: string;
    mBimfaceApp: any;
    mBimfaceAppConfig: any;
    mViewer3D: any;
    mRouteKeyFrames: any; // 路径关键结点
    mNormalMarker: any;
    mSceneObject: any;
    animationId: any;
    mAddedRouteArr: any;
    mModelAddedCallback: () => void;
    mModelNetWorkState: boolean = true; // 在线或者离线模式

    constructor(domid: string, modelAddedCallback: () => void, onlinemodel: boolean = true) {

        this.loaderSuccessCallback = this.loaderSuccessCallback.bind(this);
        this.mDomId = domid;
        this.mNormalMarker = [];
        this.mAddedRouteArr = [];
        this.mSceneObject = { keys: "1691685320050176", type: "file" };
        this.mModelAddedCallback = modelAddedCallback;
        this.mModelNetWorkState = onlinemodel;
        this.loadLoaderLibs();
    }


    /**
     * 加载bimface 资源loader 后 加载 bimface 相关资源
     */
    private async  loadLoaderLibs() {

        let bimfaceLoaderUrl = "https://static.bimface.com/api/BimfaceSDKLoader/BimfaceSDKLoader@latest-release.js";

        if (!this.mModelNetWorkState) {

            bimfaceLoaderUrl = config.libs_ip + ":" + config.libs_port + "/jssdk/BimfaceSDKLoader@latest-release.js";

        }

        Tool.asyncLoadScripts([bimfaceLoaderUrl], () => {

            this.initFileKey(this.mSceneObject);

        });

    }

    private async initFileKey(key: any) {

        if (this.mViewer3D) {

            if (this.mViewer3D._data && this.mViewer3D._data.viewToken) {
                this.mViewer3D.removeView(this.mViewer3D._data.viewToken);
            }

            this.mViewer3D.clearExternalObjects();
            this.mRouteKeyFrames = [];

        }

        let options = new BimfaceSDKLoaderConfig();

        if (this.mModelNetWorkState) {
            let viewToken = await Tool.getViewToken(key);
            options.viewToken = viewToken;

        } else {
            options.dataEnvType = BimfaceEnvOption.Local;
            options.sdkPath = config.libs_ip + ":" + config.libs_port + '/jssdk';
            options.path = config.libs_ip + ":" + config.libs_port + '/viewToken.json';

            // options.path = '/bimlibs/bimfacelibs/' + 'viewToken.json';
        }

        BimfaceSDKLoader.load(options, this.loaderSuccessCallback, (errors: any) => { console.log(errors) });

    }

    private loaderSuccessCallback(viewMetaData: any) {

        if (viewMetaData.viewType == "3DView") {

            let domId = this.mDomId;
            let dom4Show = document.getElementById(domId);

            if (this.mModelNetWorkState) {
                if (!this.mBimfaceApp) {
                    this.mBimfaceAppConfig = new Glodon.Bimface.Application.WebApplication3DConfig();
                    this.mBimfaceAppConfig.domElement = dom4Show;
                    this.mBimfaceApp = new Glodon.Bimface.Application.WebApplication3D(this.mBimfaceAppConfig);
                    this.mBimfaceApp.addView(viewMetaData.viewToken);
                    this.mViewer3D = this.mBimfaceApp.getViewer();
                }
            } else {

                if (!this.mBimfaceApp) {
                    this.mBimfaceAppConfig = new Glodon.Bimface.Application.WebApplication3DConfig();
                    this.mBimfaceAppConfig.domElement = dom4Show;
                    this.mBimfaceApp = new Glodon.Bimface.Application.WebApplication3D(this.mBimfaceAppConfig);
                    this.mViewer3D = this.mBimfaceApp.getViewer();
                    this.mViewer3D.addModel(viewMetaData);
                }
            }

            this.mViewer3D.addEventListener(Glodon.Bimface.Viewer.Viewer3DEvent.ViewAdded, (objectdata: any) => {
                this.mModelAddedCallback();
            });
        }

    }

    /**
     * 添加测试坐标点
     * @param pos 位置{ x: double,y: double,z: double }
     */
    public addPointMark(pos: any) {
        var geometry = new THREE.BoxGeometry(100, 100, 100);
        var material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
        var cube = new THREE.Mesh(geometry, material);
        cube.position.x = pos.x;
        cube.position.y = pos.y;
        cube.position.z = pos.z;
        this.mViewer3D.addExternalObject(("debugnode" + Math.random()), cube);

    }

    /**
     * 根据条件隔离构件 level 楼层
     * @param levels 楼层号
     */
    public isolateComponents(levels: Array<number>) {

        var hideOthers = Glodon.Bimface.Viewer.IsolateOption.HideOthers;

        let levelNameArr: any = [];

        for (let i = 0; i < levels.length; i++) {
            levelNameArr.push({ "levelName": "ST_" + levels[i] + "F" }, { "levelName": "AR_" + levels[i] + "F" });
        }

        this.mViewer3D.isolateComponentsByObjectData(levelNameArr, hideOthers);

        this.mViewer3D.render();

        if (levels.length === 1) {
            this.setCameraType("OrthographicCamera", 0);
            this.setAngleOfCamera("Top");
        }

    }

    /**
     * 清除隔离
     */
    public clearIsolation() {
        this.mViewer3D.clearIsolation();
        this.mViewer3D.render();
    }

    /**
     * 获取路径数据
     * @param position_a
     * @param position_b
     * @param callback
     */
    public getRouteData(position_a: any, position_b: any, callback: (obj: any) => void) {
        //let content = { startPoint: position_a, endPoint: position_b, RoadNetId: this.mSceneObject.keys }; //TODO 通知后端修改路径对应id
        let content = { startPoint: position_a, endPoint: position_b, RoadNetId: 1690516245980640 };
        let url = config.host + ":" + config.map_port + "/route/getPath";
        Tool.postRequest(url, content)
            .then((res: any) => {
                if (res && res.data) {
                    callback(res.data);
                } else {
                    alert("路径获取失败");
                }
            });
    }
    /**
     * 获取路径数据 用于交通管制获取路径
     * @param position_a
     * @param position_b
     * @param callback
     */
    public newGetRouteData(position_a: any, position_b: any, name: any, callback: Function) {
        //let content = { startPoint: position_a, endPoint: position_b, RoadNetId: this.mSceneObject.keys }; //TODO 通知后端修改路径对应id
        let content = { startPoint: position_a, endPoint: position_b, RoadNetId: 1690516245980640 };
        // let url = config.host+":" +config.map_port+ "/test/getPath";
        //    let url=config.trf_host + '/distance/getDistanceV' // 测试地址
        let url = 'http://10.8.200.179:8091/distance/getDistanceV' // 线上地址
        var obj = {
            x: position_a.x, y: position_a.y, z: position_a.z, x1: position_b.x, y1: position_b.y, z1: position_b.z, name
        }
        Tool.postRequest(url, obj)
            .then((res: any) => {
                if (res && res.data) {
                    callback(res.data);
                } else {
                    alert("路径获取失败");
                }
            });
    }

    /**
     *  注册鼠标点击回调事件
     *  @param callback 回调handle
     */
    public addMouseClickEventListener(callback: any) {
        this.mViewer3D.addEventListener(Glodon.Bimface.Viewer.Viewer3DEvent.MouseClicked, (objectdata: any) => {
            if (objectdata.hasOwnProperty('objectId')) {
                this.mViewer3D.getComponentProperty(this.mViewer3D.getObjectDataById(objectdata.objectId).elementId, (data: any) => {
                    if (data.properties.length > 0 && data.properties[0].items) {
                        for (let i = 0; i < data.properties[0].items.length; i++) {
                            if (data.properties[0].items[i].key == "categoryName") {
                                objectdata.categoryName = data.properties[0].items[i].value;
                            }
                        }
                    }
                    callback(objectdata);
                });
            }
        });
    }

    /**
     * 添加 AB点
     * @param name 图标名称，全局唯一
     * @param position
     * @param icon 图标资源，
     * @param width
     * @param height
     * @param antioversee 防遮挡
     */

    public addSpiritMarker(name: any, position: any, icon: any, width: number = 1000, height: number = 2000, antioversee: boolean = true) {
        if (!this.mViewer3D) return;
        let item = this.mViewer3D.getExternalObjectByName(name);

        if (item) {

            //item.scale.set(width, height, 1);
            item.position.x = position.x;
            item.position.y = position.y;
            item.position.z = position.z;
            item.updateMatrixWorld();
            this.mViewer3D.render();

        } else {

            //加载自定义类型sprite
            let textloader = new THREE.TextureLoader();
            textloader.load(icon, (spriteMap: any) => {

                spriteMap.wrapS = THREE.RepeatWrapping
                let spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap, depthTest: !antioversee, });
                let sprite = new THREE.Sprite(spriteMaterial);
                sprite.renderOrder = 99;
                sprite.scale.set(width, height, 1);
                sprite.position.x = position.x;
                sprite.position.y = position.y;
                sprite.position.z = position.z;
                this.mViewer3D.addExternalObject(name, sprite);
                this.mViewer3D.render();

            });

        }
    }

    /**
     * 添加路径
     * @param name 路径名称，全局唯一
     * @param pathdata
     * @param width
     * @param icon 图标资源，给定形式待定
     */
    public addRoutePath(name: any, pathdata: any, width: any, icon: any, color?: any) {

        let route = this.mViewer3D.getExternalObjectByName(name);
        if (route) {
            this.mViewer3D.removeExternalObjectByName(name);
        }

        //TODO bimface 0912更新暂时不再支持 Object.add 和 Group.add  组管理组件
        if (this.mAddedRouteArr && this.mAddedRouteArr.length > 0) {
            for (let i = 0; i < this.mAddedRouteArr.length; i++) {
                this.mViewer3D.removeExternalObjectByName(this.mAddedRouteArr[i]);
            }
            this.mAddedRouteArr = [];
        }


        let textloader = new THREE.TextureLoader();
        textloader.load(icon, (texture: any) => {

            texture.wrapS = THREE.RepeatWrapping
            texture.wrapT = THREE.RepeatWrapping
            texture.repeat.y = 1;

            let CatmullRomCurve3Arr = [];
            for (let i = 0; i < pathdata.length; i++) {
                CatmullRomCurve3Arr.push(new THREE.Vector3(pathdata[i].x, pathdata[i].y, pathdata[i].z));
            }

            let itemline, itemTubeGeometry, itemInLineTube;

            for (let i = 0; i < CatmullRomCurve3Arr.length - 1; i++) {
                itemline = new THREE.LineCurve3(CatmullRomCurve3Arr[i], CatmullRomCurve3Arr[i + 1]);

                let itemtexture = texture.clone();

                itemtexture.wrapS = THREE.RepeatWrapping;
                itemtexture.wrapT = THREE.RepeatWrapping;
                itemtexture.repeat.y = 1;

                itemtexture.repeat.x = -Math.round(itemline.getLength() / 300);

                if (Math.abs(itemtexture.repeat.x) < 1)
                    itemtexture.repeat.x = -1;
                itemtexture.needsUpdate = true;

                let inLineTubeMaterial = new THREE.MeshBasicMaterial({
                    map: itemtexture,
                    transparent: true,
                    opacity: 0.9,
                    depthTest: false,
                    color: color ? color : '#000'
                });

                itemTubeGeometry = new THREE.TubeGeometry(itemline, 50, width, 0, false);
                itemInLineTube = new THREE.Mesh(itemTubeGeometry, inLineTubeMaterial);

                name = name + Math.random();

                this.mAddedRouteArr.push(name);

                this.mViewer3D.addExternalObject(name, itemInLineTube);

            }

            this.mViewer3D.render();

        });

    }

    /**
     * 设置楼层的透明度与颜色
     * @param levels
     * @param color  #ffffff
     * @param opacity  透明度0-1
     */
    public overrideComponentsColorByObjectData(levels: Array<any>, color: any, opacity: any) {
        let gColor = new Glodon.Web.Graphics.Color(color, opacity);
        let levelNameArr: any = [];
        for (let i = 0; i < levels.length; i++) {
            levelNameArr.push({ "levelName": "ST_" + levels[i] + "F" }, { "levelName": "AR_" + levels[i] + "F" });
        }
        this.mViewer3D.overrideComponentsColorByObjectData(levelNameArr, gColor);
    }

    /**
     * 清除建筑模型以外的对象
     */
    public clearAddedObject() {
        this.mViewer3D.clearExternalObjects();
    }

    /**
     * 重置BimMap 画布长宽
     * @param width
     * @param height
     */
    public resizeBimMap(width: any, height: any) {
        this.mViewer3D.render();
        this.mViewer3D.resize(width, height);
        this.mViewer3D.render();
    }

    /**
     * 设置BimMap地图颜色
     * @param colors [ { color:'#BFEFFF', opacity:0.5 }]
     */
    public setBackgroundColor(colors: any) {

        let bimcolorarr = [];
        for (let i = 0; i < colors.length; i++) {
            bimcolorarr.push(new Glodon.Web.Graphics.Color(colors[i].color, colors[i].opacity));
        }
        this.mViewer3D.setBackgroundColor(...bimcolorarr);
        this.mViewer3D.render();

    }

    /**
     * 设置线框颜色
     * @param r
     * @param g
     * @param b
     * @param a
     */
    public setWireframeColor(r: any, g: any, b: any, a: any) {

        let bimcolor = new Glodon.Web.Graphics.Color(r, g, b, a);
        this.mViewer3D.setWireframeColor(bimcolor);
        this.mViewer3D.render();

    }

    /**
     * 添加机器人
     * @param meshurl .3ds 格式机器人路径
     * @param size 缩放比例
     * @param position 机器人初始位置
     * @param visible 机器人可见性 默认false
     */
    public async addRobot(meshurl: any, size: number, position: any, visible: boolean = false) {

        if (!this.mViewer3D) return;

        let promise = new Promise((resolve, reject) => {

            let tdsLoaderurl = "http://static.bimface.com/attach/341bb8bde7bf4a5898ecdf58c2a476fb_TDSLoader.js";

            if (!this.mModelNetWorkState) {
                tdsLoaderurl = config.libs_ip + ":" + config.libs_port + "/attach/TDSLoader.js";
            }


            Tool.asyncLoadScripts([tdsLoaderurl], () => {

                let ritem = this.mViewer3D.getExternalObjectByName(DEFAULT_ROBOT_NAME);
                if (ritem) {
                    //item.scale.set(width, height, 1);
                    ritem.position.x = position.x;
                    ritem.position.y = position.y;
                    ritem.position.z = position.z
                    ritem.updateMatrixWorld();
                    this.mViewer3D.render();

                } else {

                    this.loadExternalComponent(meshurl, (object: any) => {

                        object.traverse((child: any) => {
                            if (child instanceof THREE.Mesh) {

                                child.material.depthTest = false;
                                child.material.transparent = true;
                            }
                        });
                        object.renderOrder = 9999999;
                        object.renderingGroupId = 9999999;
                        object.scale.set(size, size, size);
                        object.visible = visible;

                        this.mViewer3D.addExternalObject(DEFAULT_ROBOT_NAME, object);
                        var tempQuaternion = new THREE.Quaternion();
                        tempQuaternion.setFromAxisAngle(new THREE.Vector3(0.0, 0.0, 1.0), 0);
                        this.setTransform(DEFAULT_ROBOT_NAME, new THREE.Vector3(position.x, position.y, position.z), tempQuaternion);
                        this.mViewer3D.render();
                        resolve('OK');

                    })
                }

            });

        });

        let result = await promise;
        return result;

    }

    private setAngleOfCamera(angle: string) {
        let view;
        switch (angle) {

            case "Bottom":
                view = Glodon.Bimface.Viewer.ViewOption.Bottom;
                break;

            case "East":
                view = Glodon.Bimface.Viewer.ViewOption.East;
                break;

            case "Home":
                view = Glodon.Bimface.Viewer.ViewOption.Home;
                break;

            case "North":
                view = Glodon.Bimface.Viewer.ViewOption.North;
                break;

            case "NorthEast":
                view = Glodon.Bimface.Viewer.ViewOption.NorthEast;
                break;

            case "NorthWest":
                view = Glodon.Bimface.Viewer.ViewOption.NorthWest;
                break;

            case "South":
                view = Glodon.Bimface.Viewer.ViewOption.South;
                break;

            case "SouthEast":
                view = Glodon.Bimface.Viewer.ViewOption.SouthEast;
                break;

            case "SouthWest":
                view = Glodon.Bimface.Viewer.ViewOption.SouthWest;
                break;
            case "Top":
                view = Glodon.Bimface.Viewer.ViewOption.Top;
                break;

            case "West":
                view = Glodon.Bimface.Viewer.ViewOption.West;
                break;

            default:
                view = Glodon.Bimface.Viewer.ViewOption.Home;
                break;
        }

        this.mViewer3D.setView(view);
    }

    private setCameraType(cameraType: string, fov: number) {
        this.mViewer3D.setCameraType(cameraType, fov);
    }


    private createCurve1(pos1: any, pos2: any) {

        return new THREE.CatmullRomCurve3([
            new THREE.Vector3(pos1.x, pos1.y, pos1.z),
            new THREE.Vector3(pos2.x, pos2.y, pos2.z)
        ]);

    }

    /**
     * 轨迹预览
     * @param routePts
     * @param speed
     * @param cameraangle  动画时相机视角，同setAngleOfCamera 默认为"Home"
     */
    public overviewAnimation(routePts: any, speed: any = 100, cameraangle: string = "Home") {

        if (!routePts || routePts.length < 2) {
            console.log("path data error");
            return;
        }

        this.changRobotVisible(DEFAULT_ROBOT_NAME, true);

        if (this.animationId)
            cancelAnimationFrame(this.animationId);

        this.setAngleOfCamera(cameraangle);

        let minx = routePts[0].x;
        let miny = routePts[0].y;
        let minz = routePts[0].z;
        let maxx = routePts[0].x;
        let maxy = routePts[0].y;
        let maxz = routePts[0].z;

        for (let i = 1; i < routePts.length; i++) {
            if (routePts[i].x < minx)
                minx = routePts[i].x;

            if (routePts[i].y < miny)
                miny = routePts[i].y;

            if (routePts[i].z < minx)
                minx = routePts[i].x;

            if (routePts[i].z < minz)
                minz = routePts[i].z;

            if (routePts[i].x > maxx)
                maxx = routePts[i].x;

            if (routePts[i].y > maxy)
                maxy = routePts[i].y;

            if (routePts[i].z > maxz)
                maxz = routePts[i].z;
        }

        this.zoomToBoundingBox({ min: { x: minx, y: miny, z: minz }, max: { x: maxx, y: maxy, z: maxz } });

        // 构造移动路径
        let i = 0, length, delta = 0.01, pos1, pos2;
        let viewer3D = this.mViewer3D;
        pos1 = routePts[i];
        pos2 = routePts[i + 1];
        let curve1 = this.createCurve1(pos1, pos2);
        length = Tool.vector_distance(pos1.x, pos1.y, pos2.x, pos2.y);
        delta = speed / length;
        let setTransform = this.setTransform.bind(this);
        let createCurve1 = this.createCurve1;

        // 通过更新外部构件的坐标位置实现动画效果
        let position1 = new THREE.Vector3(0, 0, 1000);
        let rotation = new THREE.Quaternion();
        rotation.setFromAxisAngle(new THREE.Vector3(0.0, 0.0, 1.0), routePts[i].angle / 180 * Math.PI + Math.PI);
        let pos = 0;
        let _this = this;
        function animate() {
            _this.animationId = requestAnimationFrame(animate);
            if (pos < 1) {
                position1 = curve1.getPointAt(pos);
                pos += delta; //0.005;
            } else {
                if (i < routePts.length - 2) {
                    i++;
                    pos1 = routePts[i];
                    pos2 = routePts[i + 1];
                    rotation.setFromAxisAngle(new THREE.Vector3(0.0, 0.0, 1.0), routePts[i].angle / 180 * Math.PI + Math.PI);
                    curve1 = createCurve1(pos1, pos2);
                    if (Math.round(pos1.x) == Math.round(pos2.x) && Math.round(pos1.y) == Math.round(pos2.y)) {
                        length = Tool.vector_distance(pos1.x, pos1.z, pos2.x, pos2.z);
                    } else {
                        length = Tool.vector_distance(pos1.x, pos1.y, pos2.x, pos2.y);
                    }
                    delta = speed / length;
                } else if (i == routePts.length - 1) {
                    cancelAnimationFrame(_this.animationId);
                    _this.mViewer3D.setView("Home");
                    _this.mViewer3D.render();
                }
                pos = 0;
            }
            //机器人z轴向上抬起
            setTransform(DEFAULT_ROBOT_NAME, { x: position1.x, y: position1.y, z: (position1.z + 430) }, rotation);
            viewer3D.render();
        }

        setTimeout(() => {

            animate();

        }, 2000);

    }


    private setTransform(name: string, position: any, rotation: any) {

        //console.log(position);
        let group = this.mViewer3D.getExternalObjectByName(name);
        if (!group) {
            console.log("!Group"); return;
        }
        // 调整构件位置
        position = position || (group.position);
        group.position.x = position.x;
        group.position.y = position.y;
        group.position.z = position.z;
        // 调整构件角度
        rotation = rotation || group.quaternion;
        group.setRotationFromQuaternion(rotation);
        group.updateMatrixWorld();

    }

    /**
     * 移动相机视角到 boundingBox
     * @param boundingBox
     */
    public zoomToBoundingBox(boundingBox: any) {
        this.mViewer3D.zoomToBoundingBox(boundingBox);
    }

    public zoomIn() {
        this.mViewer3D.zoomIn();
    }

    public zoomOut() {
        this.mViewer3D.zoomOut();
    }

    public changRobotVisible(robotname: string, visible: boolean): void {

        let robot = this.mViewer3D.getExternalObjectByName(robotname);
        if (robot) {
            robot.visible = visible;
            robot.updateMatrixWorld();
        }

    }

    private loadExternalComponent(url: string, callback: Function) {
        var loader = new THREE.TDSLoader();
        loader.load(url, function (object: any) {
            callback && callback(object);
        });
    }

    /**
     *
     * @param componentids 需要添加选中的id数组
     */
    public addSelectComponents(componentids: Array<string>): void {
        this.mViewer3D.addSelectedComponentsById(componentids);
    }

    /**
     * 清楚所有选中构建
     * @param componentids 需要移除选中的id数组
     */
    public removeSelectComponents(componentids: Array<string>): void {
        this.mViewer3D.removeSelectedId(componentids);
    }

    /**
     * 添加机器人
     * @param name 机器人名称
     * @param meshurl .3ds 格式机器人路径
     * @param size 缩放比例
     * @param position 机器人初始位置
     * @param visible 机器人可见性 默认false
     */
    public async addRobots(name: string, meshurl: any, size: number, position: any, visible: boolean = false) {
        if (!this.mViewer3D) return;

        let promise = new Promise((resolve, reject) => {

            Tool.asyncLoadScripts([config.bmomHost + "/staticfile/plugins/bimface/TDSLoader.js"], () => {

                this.loadExternalComponent(meshurl, (object: any) => {

                    object.traverse((child: any) => {
                        if (child instanceof THREE.Mesh) {

                            child.material.depthTest = false;
                            child.material.transparent = true;
                        }
                    });
                    object.renderOrder = 9999999;
                    object.renderingGroupId = 9999999;
                    object.scale.set(size, size, size);
                    object.visible = visible;
                    this.mViewer3D.addExternalObject(name, object);
                    var tempQuaternion = new THREE.Quaternion();
                    tempQuaternion.setFromAxisAngle(new THREE.Vector3(0.0, 0.0, 1.0), 0);
                    this.setTransform(name, new THREE.Vector3(position.x, position.y, position.z), tempQuaternion);
                    this.mViewer3D.render();
                    resolve('OK');
                })

            });

        });

        let result = await promise;
        return result;

    }

    public overviewAnimations(routePts: any, speed: any = 100, cameraangle: string = "Home", name: string) {

        if (!routePts || routePts.length < 2) {
            console.log("path data error");
            return;
        }

        this.changRobotVisible(name, true);

        if (this.animationId)
            cancelAnimationFrame(this.animationId);

        this.setAngleOfCamera(cameraangle);

        let minx = routePts[0].x;
        let miny = routePts[0].y;
        let minz = routePts[0].z;
        let maxx = routePts[0].x;
        let maxy = routePts[0].y;
        let maxz = routePts[0].z;

        for (let i = 1; i < routePts.length; i++) {
            if (routePts[i].x < minx)
                minx = routePts[i].x;

            if (routePts[i].y < miny)
                miny = routePts[i].y;

            if (routePts[i].z < minx)
                minx = routePts[i].x;

            if (routePts[i].z < minz)
                minz = routePts[i].z;

            if (routePts[i].x > maxx)
                maxx = routePts[i].x;

            if (routePts[i].y > maxy)
                maxy = routePts[i].y;

            if (routePts[i].z > maxz)
                maxz = routePts[i].z;
        }

        this.zoomToBoundingBox({ min: { x: minx, y: miny, z: minz }, max: { x: maxx, y: maxy, z: maxz } });

        // 构造移动路径
        let i = 0, length, delta = 0.01, pos1, pos2;
        let viewer3D = this.mViewer3D;
        pos1 = routePts[i];
        pos2 = routePts[i + 1];
        let curve1 = this.createCurve1(pos1, pos2);
        length = Tool.vector_distance(pos1.x, pos1.y, pos2.x, pos2.y);
        delta = speed / length;
        let setTransform = this.setTransform.bind(this);
        let createCurve1 = this.createCurve1;

        // 通过更新外部构件的坐标位置实现动画效果
        let position1 = new THREE.Vector3(0, 0, 1000);
        let rotation = new THREE.Quaternion();
        rotation.setFromAxisAngle(new THREE.Vector3(0.0, 0.0, 1.0), routePts[i].angle / 180 * Math.PI + Math.PI);
        let pos = 0;
        let _this = this;
        function animate() {
            _this.animationId = requestAnimationFrame(animate);
            if (pos < 1) {
                position1 = curve1.getPointAt(pos);
                pos += delta; //0.005;
            } else {
                if (i < routePts.length - 2) {
                    i++;
                    pos1 = routePts[i];
                    pos2 = routePts[i + 1];
                    rotation.setFromAxisAngle(new THREE.Vector3(0.0, 0.0, 1.0), routePts[i].angle / 180 * Math.PI + Math.PI);
                    curve1 = createCurve1(pos1, pos2);
                    if (Math.round(pos1.x) == Math.round(pos2.x) && Math.round(pos1.y) == Math.round(pos2.y)) {
                        length = Tool.vector_distance(pos1.x, pos1.z, pos2.x, pos2.z);
                    } else {
                        length = Tool.vector_distance(pos1.x, pos1.y, pos2.x, pos2.y);
                    }
                    delta = speed / length;
                } else if (i === routePts.length - 1) {
                    cancelAnimationFrame(_this.animationId);
                    _this.mViewer3D.setView("Home");
                    _this.mViewer3D.render();
                }
                pos = 0;
            }
            //机器人z轴向上抬起
            setTransform(name, { x: position1.x, y: position1.y, z: (position1.z + 430) }, rotation);
            viewer3D.render();
        }
        setTimeout(() => {

            animate();

        }, 2000);

    }
}
