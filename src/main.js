import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118.1/build/three.module.js';

import {third_person_camera} from './third-person-camera.js';
import {entity_manager} from './entity-manager.js';
import {player_entity} from './player-entity.js'
import {entity} from './entity.js';
import {gltf_component} from './gltf-component.js';
import {goose_component} from './goose-component.js';
import {player_input} from './player-input.js';
import {npc_entity} from './npc-entity.js';
import {math} from './math.js';
import {spatial_hash_grid} from './spatial-hash-grid.js';
import {ui_controller} from './ui-controller.js';
import {quest_component} from './quest-component.js';
import {PLCgame_component} from './PLCgame-component.js';
import {spatial_grid_controller} from './spatial-grid-controller.js';
import {inventory_controller} from './inventory-controller.js';


const _VS = `
varying vec3 vWorldPosition;

void main() {
  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
  vWorldPosition = worldPosition.xyz;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;


const _FS = `
uniform vec3 topColor;
uniform vec3 bottomColor;
uniform float offset;
uniform float exponent;

varying vec3 vWorldPosition;

void main() {
  float h = normalize( vWorldPosition + offset ).y;
  gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );
}`;



class virtualLearningFactory {
  constructor() {
    this._Initialize();
    //var mediaElement = new Audio( './resources/Sounds/AnimalCrossingMusic.mp3' );
    //mediaElement.loop = true;
   // mediaElement.autoplay=true;
   // mediaElement.muted=true;
    //mediaElement.play();
    //audio.setMediaElementSource( mediaElement );
    //this._gameStarted = false;
    //document.getElementById('game-menu').onclick = (msg) => this._OnStart(msg);
  }
  
  _Initialize() {
    this._threejs = new THREE.WebGLRenderer({
      antialias: true,
    });
    
    // Some basic world setup
    this._threejs.outputEncoding = THREE.sRGBEncoding;
    this._threejs.gammaFactor = 2.2;
    this._threejs.shadowMap.enabled = true;
    this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
    this._threejs.setPixelRatio(window.devicePixelRatio);
    this._threejs.setSize(window.innerWidth, window.innerHeight);
    this._threejs.domElement.id = 'threejs';

    document.getElementById('container').appendChild(this._threejs.domElement);

    window.addEventListener('resize', () => {
      this._OnWindowResize();
    }, false);

    // More setup
    const fov = 60;
    const aspect = 1920 / 1080;
    const near = 1.0;
    const far = 10000.0;
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this._camera.position.set(25, 10, 25);

    this._scene = new THREE.Scene();
    this._scene.background = new THREE.Color(0xFFFFFF);
    this._scene.fog = new THREE.FogExp2(0x89b2eb, 0.002);

    // Lighting
    let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    light.position.set(-10, 500, 10);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    light.shadow.bias = -0.001;
    light.shadow.mapSize.width = 4096;
    light.shadow.mapSize.height = 4096;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 1000.0;
    light.shadow.camera.left = 100;
    light.shadow.camera.right = -100;
    light.shadow.camera.top = 100;
    light.shadow.camera.bottom = -100;
    this._scene.add(light);

    this._sun = light;

    // Create a new plane which will serve as the floor that the player walks on
    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(6000, 6000, 10, 10),
        new THREE.MeshStandardMaterial({
            //color: 0x1e601c,
            color: '#0f4f1a',
          }));
    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;
    this._scene.add(plane);

    this._entityManager = new entity_manager.EntityManager();
    this._grid = new spatial_hash_grid.SpatialHashGrid(
        [[-1000, -1000], [1000, 1000]], [100, 100]);

    // Load all the "objects" for the scene
    this._LoadControllers();
    this._LoadPlayer();
    this._LoadClouds();
    this._LoadSky();
    this._loadModelBuilding();
    this._loadModelTable();
    this._LoadBackgroundChars();
    this._loadModelPlant2();
    this._loadModelPlant4();
    this._loadModelPlant5();
    this._loadModelPlant6();
    this._loadModelGrass1();
    this._loadModelGrass2();
    this._loadModelGrass3();
    this._loadModelGrass4();
    this._loadModelGrass5();
    this._loadModelBackShelfs();
    this._loadModelInsideTableCollisionFront();
    this._loadModelInsideTableCollisionRight();
    this._loadModelInsideTableCollisionLeft();
    this._loadModelGrassInsideBack();
    this._loadModelGrassInsideLeft();
    this._loadModelGrassInsideRight();
    
    // Code for room inside of ETB below:
    // Walls left side
    var height=45;
    const wallsT = new THREE.Mesh(new THREE.BoxGeometry(2, height, 95),
    new THREE.MeshStandardMaterial({ color: '#ac8e82' }))
    // We need to move the wall up exactly half of the height (45 divide by 2)
    wallsT.position.y = height/2
    wallsT.position.x = 30
    wallsT.position.z = 255
    this._scene.add(wallsT);
    // const pos = new THREE.Vector3(0,0,1);
    // walls2.rotateOnWorldAxis(pos, THREE.Math.degToRad(45));
    // Walls right side
    const wallsT2 = new THREE.Mesh(new THREE.BoxGeometry(2, height, 95),
    new THREE.MeshStandardMaterial({ color: '#ac8e82' }))
    // We need to move the wall up exactly half of the height (45 divide by 2)
    wallsT2.position.y = height/2
    wallsT2.position.x = -55
    wallsT2.position.z = 255
    this._scene.add(wallsT2);
  
    // Walls back side
    const wallsT3 = new THREE.Mesh(new THREE.BoxGeometry(90, height, 2),
    new THREE.MeshStandardMaterial({ color: '#ac8e82' }))
    // We need to move the wall up exactly half of the height (45 divide by 2)
    wallsT3.position.y = height/2
    wallsT3.position.x = -10
    wallsT3.position.z = 300
    this._scene.add(wallsT3);

    // Walls front right side
    const wallsT4 = new THREE.Mesh(new THREE.BoxGeometry(40, height, 2),
    new THREE.MeshStandardMaterial({ color: '#ac8e82' }))
    // We need to move the wall up exactly half of the height (45 divide by 2)
    wallsT4.position.y = height/2
    wallsT4.position.x = -40
    wallsT4.position.z = 210
    this._scene.add(wallsT4);
    //
    // Walls front left side
    const wallsT5 = new THREE.Mesh(new THREE.BoxGeometry(45, height, 2),
    new THREE.MeshStandardMaterial({ color: '#ac8e82' }))
    // We need to move the wall up exactly half of the height (45 divide by 2)
    wallsT5.position.y = height/2
    wallsT5.position.x = 15
    wallsT5.position.z = 210
    this._scene.add(wallsT5);

    this._previousRAF = null;
    this._RAF();
  }

  _LoadControllers() 
  {
    const ui = new entity.Entity();
    ui.AddComponent(new ui_controller.UIController());
    this._entityManager.Add(ui, 'ui');
  }

  _LoadSky() 
  {
    const hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0xFFFFFFF, 0.6);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    this._scene.add(hemiLight);

    const uniforms = {
      "topColor": { value: new THREE.Color(0x0077ff) },
      "bottomColor": { value: new THREE.Color(0xffffff) },
      "offset": { value: 33 },
      "exponent": { value: 0.6 }
    };
    uniforms["topColor"].value.copy(hemiLight.color);

    this._scene.fog.color.copy(uniforms["bottomColor"].value);

    const skyGeo = new THREE.SphereBufferGeometry(1000, 32, 15);
    const skyMat = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: _VS,
        fragmentShader: _FS,
        side: THREE.BackSide
    });

    const sky = new THREE.Mesh(skyGeo, skyMat);
    this._scene.add(sky);
  }

  _LoadClouds() 
  {
    for (let i = 0; i < 20; ++i) {
      const index = math.rand_int(1, 3);
    const pos = new THREE.Vector3(
        (Math.random() * 2.0 - 1.0) * 500,
        150,
        (Math.random() * 2.0 - 1.0) * 500);

      const e = new entity.Entity();
      e.AddComponent(new gltf_component.StaticModelComponent({
        scene: this._scene,
        resourcePath: './resources/Clouds/GLTF/',
        resourceName: 'Cloud' + index + '.glb',
        position: pos,
        scale: Math.random() * 5 + 10,
        emissive: new THREE.Color(0x808080),
      }));
      e.SetPosition(pos);
      this._entityManager.Add(e);
      e.SetActive(false);
    }
  }

  // Load NPC (not playable characters for background)
  _LoadBackgroundChars() 
  {
    for (let i = 0; i < 10; ++i) {
      const names = [
          'Doctor_Female_Young', 'OldClassy_Male',
          'Kimono_Male', 'Casual3_Female',
          'BlueSoldier_Female',
          'Ninja_Male',
      ];
      const name = names[math.rand_int(0, names.length - 1)];

      const pos = new THREE.Vector3(
          (Math.random() * 2.0 - 1.0) * 200,
          0,
          (Math.random() * 2.0 - 1.0) * 200);

      const e = new entity.Entity();
      e.AddComponent(new gltf_component.StaticModelComponent({
        scene: this._scene,
        resourcePath: './resources/Ultimate Animated Character Pack - Nov 2019/FBX/',
        resourceName: name + '.fbx',
        resourceAnimation: name + '.fbx',
        scale: 0.04,
        emissive: new THREE.Color(0x000000),
        specular: new THREE.Color(0x000000),
        receiveShadow: true,
        castShadow: true,
      }));
      e.AddComponent(
          new spatial_grid_controller.SpatialGridController({grid: this._grid}));
      e.SetPosition(pos);
      this._entityManager.Add(e);
      //e.SetActive(false);
    }
  }
  
  // Inside ETB pipes for back side walls
  _loadModelBackShelfs() {
    var xVal = 25;
    for (let i = 0; i < 8; ++i) {
    const name = 'Props_Shelf';

    const pos = new THREE.Vector3(
        xVal, 0, 300);

    const e = new entity.Entity();
    e.AddComponent(new gltf_component.StaticModelComponent({
      scene: this._scene,
      resourcePath: './resources/Table/FBX/',
      resourceName: name + '.fbx',
      scale: 0.05,
      emissive: new THREE.Color(0x000000),
      specular: new THREE.Color(0x000000),
      receiveShadow: true,
      castShadow: true,
    }));
    e.AddComponent(
        new spatial_grid_controller.SpatialGridController({grid: this._grid}));
    e.SetPosition(pos);
    this._entityManager.Add(e);
    e.SetActive(false);
    xVal-=10;
    }
}
// Many of the functions below are fbx objects placed in the scene to prevent the user from walking through objects.
// There is a problem with collision detection due to the height of object being greater than the player, which is why this was the quick approach to solve this.
  // ETB plant by tree for collision
  _loadModelPlant2() {
    const name = 'Plant_4';

    const pos = new THREE.Vector3(
        65, 0, 60);

    const e = new entity.Entity();
    e.AddComponent(new gltf_component.StaticModelComponent({
      scene: this._scene,
      resourcePath: './resources/nature/FBX/',
      resourceName: name + '.fbx',
      scale: 0.05,
      emissive: new THREE.Color(0x000000),
      specular: new THREE.Color(0x000000),
      receiveShadow: true,
      castShadow: true,
    }));
    e.AddComponent(
        new spatial_grid_controller.SpatialGridController({grid: this._grid}));
    e.SetPosition(pos);
    this._entityManager.Add(e);
    e.SetActive(false);
}

// ETB plant by tree for collision
_loadModelPlant4() {
  const name = 'Plant_4';

  const pos = new THREE.Vector3(
      75, 0, 60);

  const e = new entity.Entity();
  e.AddComponent(new gltf_component.StaticModelComponent({
    scene: this._scene,
    resourcePath: './resources/nature/FBX/',
    resourceName: name + '.fbx',
    scale: 0.05,
    emissive: new THREE.Color(0x000000),
    specular: new THREE.Color(0x000000),
    receiveShadow: true,
    castShadow: true,
  }));
  e.AddComponent(
      new spatial_grid_controller.SpatialGridController({grid: this._grid}));
  e.SetPosition(pos);
  this._entityManager.Add(e);
  e.SetActive(false);
}
_loadModelPlant5() {
  const name = 'Plant_4';

  const pos = new THREE.Vector3(
      70, 0, 65);

  const e = new entity.Entity();
  e.AddComponent(new gltf_component.StaticModelComponent({
    scene: this._scene,
    resourcePath: './resources/nature/FBX/',
    resourceName: name + '.fbx',
    scale: 0.05,
    emissive: new THREE.Color(0x000000),
    specular: new THREE.Color(0x000000),
    receiveShadow: true,
    castShadow: true,
  }));
  e.AddComponent(
      new spatial_grid_controller.SpatialGridController({grid: this._grid}));
  e.SetPosition(pos);
  this._entityManager.Add(e);
  e.SetActive(false);
}

_loadModelPlant6() {
  const name = 'Plant_4';

  const pos = new THREE.Vector3(
      70, 0, 50);

  const e = new entity.Entity();
  e.AddComponent(new gltf_component.StaticModelComponent({
    scene: this._scene,
    resourcePath: './resources/nature/FBX/',
    resourceName: name + '.fbx',
    scale: 0.05,
    emissive: new THREE.Color(0x000000),
    specular: new THREE.Color(0x000000),
    receiveShadow: true,
    castShadow: true,
  }));
  e.AddComponent(
      new spatial_grid_controller.SpatialGridController({grid: this._grid}));
  e.SetPosition(pos);
  this._entityManager.Add(e);
  e.SetActive(false);
}


_loadModelInsideTableCollisionFront()
  {
    var xVal = 0;
    for (let i = 0; i < 4; ++i) {
      const name = 'Doctor_Female_Young';

      const pos = new THREE.Vector3(xVal,-22,247);

      const e = new entity.Entity();
      e.AddComponent(new gltf_component.StaticModelComponent({
        scene: this._scene,
        resourcePath: './resources/Ultimate Animated Character Pack - Nov 2019/FBX/',
        resourceName: name + '.fbx',
        resourceAnimation: name + '.fbx',
        scale: 0.06,
        emissive: new THREE.Color(0x000000),
        specular: new THREE.Color(0x000000),
        receiveShadow: true,
        castShadow: true,
      }));
      e.AddComponent(
          new spatial_grid_controller.SpatialGridController({grid: this._grid}));
      e.SetPosition(pos);
      this._entityManager.Add(e);
      xVal-=6;
    }
  }

  _loadModelInsideTableCollisionRight()
  {
    var yVal = 247;
    for (let i = 0; i < 4; ++i) {
      const name = 'Doctor_Female_Young';
      const pos = new THREE.Vector3(-19,-22,yVal);

      const e = new entity.Entity();
      e.AddComponent(new gltf_component.StaticModelComponent({
        scene: this._scene,
        resourcePath: './resources/Ultimate Animated Character Pack - Nov 2019/FBX/',
        resourceName: name + '.fbx',
        resourceAnimation: name + '.fbx',
        scale: 0.06,
        emissive: new THREE.Color(0x000000),
        specular: new THREE.Color(0x000000),
        receiveShadow: true,
        castShadow: true,
      }));
      e.AddComponent(
          new spatial_grid_controller.SpatialGridController({grid: this._grid}));
      e.SetPosition(pos);
      this._entityManager.Add(e);
      yVal+=6;
    }
  }

  _loadModelInsideTableCollisionLeft()
  {
    var yVal = 255;
    for (let i = 0; i < 4; ++i) {
      const name = 'Doctor_Female_Young';
      const pos = new THREE.Vector3(7,-22,yVal);

      const e = new entity.Entity();
      e.AddComponent(new gltf_component.StaticModelComponent({
        scene: this._scene,
        resourcePath: './resources/Ultimate Animated Character Pack - Nov 2019/FBX/',
        resourceName: name + '.fbx',
        resourceAnimation: name + '.fbx',
        scale: 0.06,
        emissive: new THREE.Color(0x000000),
        specular: new THREE.Color(0x000000),
        receiveShadow: true,
        castShadow: true,
      }));
      e.AddComponent(
          new spatial_grid_controller.SpatialGridController({grid: this._grid}));
      e.SetPosition(pos);
      this._entityManager.Add(e);
      yVal+=6;
    }
  }

  // ETB small grass front left of building for collision
  _loadModelGrass1() {
    var xVal = 45;
    for (let i = 0; i < 11; ++i) {
    const name = 'Grass_Short';

    const pos = new THREE.Vector3(
        xVal, 0, 207);
    
    const e = new entity.Entity();
    e.AddComponent(new gltf_component.StaticModelComponent({
      scene: this._scene,
      resourcePath: './resources/nature/FBX/',
      resourceName: name + '.fbx',
      scale: 0.05,
      emissive: new THREE.Color(0x000000),
      specular: new THREE.Color(0x000000),
      receiveShadow: true,
      castShadow: true,
    }));
    e.AddComponent(
        new spatial_grid_controller.SpatialGridController({grid: this._grid}));
    e.SetPosition(pos);
    this._entityManager.Add(e);
    e.SetActive(false);
    xVal-=5;
    }
}

// ETB small grass2 front right of building for collision
_loadModelGrass2() {
  var xVal = -20;
  for (let i = 0; i < 9; ++i) {
  const name = 'Grass_Short';

  const pos = new THREE.Vector3(
    xVal, 0, 206);

  const e = new entity.Entity();
  e.AddComponent(new gltf_component.StaticModelComponent({
    scene: this._scene,
    resourcePath: './resources/nature/FBX/',
    resourceName: name + '.fbx',
    scale: 0.05,
    emissive: new THREE.Color(0x000000),
    specular: new THREE.Color(0x000000),
    receiveShadow: true,
    castShadow: true,
  }));
  e.AddComponent(
      new spatial_grid_controller.SpatialGridController({grid: this._grid}));
  e.SetPosition(pos);
  this._entityManager.Add(e);
  e.SetActive(false);
  xVal-=5;
  }
}

// ETB small grass3 right side building for collision
_loadModelGrass3() {
  var yVal = 210;
  for (let i = 0; i < 25; ++i) {
  const name = 'Grass_Short';

  const pos = new THREE.Vector3(
      -61, 0, yVal);

  const e = new entity.Entity();
  e.AddComponent(new gltf_component.StaticModelComponent({
    scene: this._scene,
    resourcePath: './resources/nature/FBX/',
    resourceName: name + '.fbx',
    scale: 0.05,
    emissive: new THREE.Color(0x000000),
    specular: new THREE.Color(0x000000),
    receiveShadow: true,
    castShadow: true,
  }));
  e.AddComponent(
      new spatial_grid_controller.SpatialGridController({grid: this._grid}));
  e.SetPosition(pos);
  this._entityManager.Add(e);
  e.SetActive(false);
  yVal+=5;
  }
}

  // ETB small grass behind building for collision
  _loadModelGrass4() {
    var xVal = 45;
    for (let i = 0; i < 22; ++i) {
    const name = 'Grass_Short';

    const pos = new THREE.Vector3(
        xVal, 0, 335);
    
    const e = new entity.Entity();
    e.AddComponent(new gltf_component.StaticModelComponent({
      scene: this._scene,
      resourcePath: './resources/nature/FBX/',
      resourceName: name + '.fbx',
      scale: 0.05,
      emissive: new THREE.Color(0x000000),
      specular: new THREE.Color(0x000000),
      receiveShadow: true,
      castShadow: true,
    }));
    e.AddComponent(
        new spatial_grid_controller.SpatialGridController({grid: this._grid}));
    e.SetPosition(pos);
    this._entityManager.Add(e);
    e.SetActive(false);
    xVal-=5;
    }
}

  // ETB small grass left side of building for collision
  _loadModelGrass5() {
    var yVal = 205;
    for (let i = 0; i < 26; ++i) {
    const name = 'Grass_Short';

    const pos = new THREE.Vector3(
        45, 0, yVal);
    
    const e = new entity.Entity();
    e.AddComponent(new gltf_component.StaticModelComponent({
      scene: this._scene,
      resourcePath: './resources/nature/FBX/',
      resourceName: name + '.fbx',
      scale: 0.05,
      emissive: new THREE.Color(0x000000),
      specular: new THREE.Color(0x000000),
      receiveShadow: true,
      castShadow: true,
    }));
    e.AddComponent(
        new spatial_grid_controller.SpatialGridController({grid: this._grid}));
    e.SetPosition(pos);
    this._entityManager.Add(e);
    e.SetActive(false);
    yVal+=5;
    }
}

  // ETB small grass inside main ETB building for room back side for collision
  _loadModelGrassInsideBack() {
    var xVal = 45;
    for (let i = 0; i < 22; ++i) {
    const name = 'Grass_Short';

    const pos = new THREE.Vector3(
        xVal, 0, 300);
    
    const e = new entity.Entity();
    e.AddComponent(new gltf_component.StaticModelComponent({
      scene: this._scene,
      resourcePath: './resources/nature/FBX/',
      resourceName: name + '.fbx',
      scale: 0.05,
      emissive: new THREE.Color(0x000000),
      specular: new THREE.Color(0x000000),
      receiveShadow: true,
      castShadow: true,
    }));
    e.AddComponent(
        new spatial_grid_controller.SpatialGridController({grid: this._grid}));
    e.SetPosition(pos);
    this._entityManager.Add(e);
    e.SetActive(false);
    xVal-=5;
    }
}

// ETB small grass inside main ETB building for room left side for collision
_loadModelGrassInsideLeft() {
  var yVal = 205;
  for (let i = 0; i < 26; ++i) {
  const name = 'Grass_Short';

  const pos = new THREE.Vector3(
      30, 0, yVal);
  
  const e = new entity.Entity();
  e.AddComponent(new gltf_component.StaticModelComponent({
    scene: this._scene,
    resourcePath: './resources/nature/FBX/',
    resourceName: name + '.fbx',
    scale: 0.05,
    emissive: new THREE.Color(0x000000),
    specular: new THREE.Color(0x000000),
    receiveShadow: true,
    castShadow: true,
  }));
  e.AddComponent(
      new spatial_grid_controller.SpatialGridController({grid: this._grid}));
  e.SetPosition(pos);
  this._entityManager.Add(e);
  e.SetActive(false);
  yVal+=5;
  }
}

// ETB small grass inside main ETB building for room right side for collision
_loadModelGrassInsideRight() {
  var yVal = 210;
  for (let i = 0; i < 25; ++i) {
  const name = 'Grass_Short';

  const pos = new THREE.Vector3(
      -55, 0, yVal);

  const e = new entity.Entity();
  e.AddComponent(new gltf_component.StaticModelComponent({
    scene: this._scene,
    resourcePath: './resources/nature/FBX/',
    resourceName: name + '.fbx',
    scale: 0.05,
    emissive: new THREE.Color(0x000000),
    specular: new THREE.Color(0x000000),
    receiveShadow: true,
    castShadow: true,
  }));
  e.AddComponent(
      new spatial_grid_controller.SpatialGridController({grid: this._grid}));
  e.SetPosition(pos);
  this._entityManager.Add(e);
  e.SetActive(false);
  yVal+=5;
  }
}

  _loadModelBuilding() {
    const name = 'etb-outside5';
    const pos = new THREE.Vector3(
        0, 0, 275);

    const modelBuilding = new entity.Entity();
    modelBuilding.AddComponent(new gltf_component.StaticModelComponent({
      scene: this._scene,
      resourcePath: './resources/BuildingPack/Textured Models/Finished Textured Buildings/FBX/',
      resourceName: name + '.glb',
      scale: 1.15,
      emissive: new THREE.Color(0x000000),
      specular: new THREE.Color(0x000000),
      receiveShadow: true,
      castShadow: true,
    }));
    //modelBuilding.AddComponent(
    //    new spatial_grid_controller.SpatialGridController({grid: this._grid}));
    modelBuilding.SetPosition(pos);
    this._entityManager.Add(modelBuilding);
    modelBuilding.SetActive(false);
}

_loadModelTable() {
  const name = 'factory1';
  const pos = new THREE.Vector3(
      -5, 0, 260);


  const modelTable = new entity.Entity();
  modelTable.AddComponent(new gltf_component.StaticModelComponent({
    scene: this._scene,
    resourcePath: './resources/BuildingPack/Textured Models/Finished Textured Buildings/FBX/',
    resourceName: name + '.glb',
    scale: 0.18,
    emissive: new THREE.Color(0x000000),
    specular: new THREE.Color(0x000000),
    receiveShadow: true,
    castShadow: true,
  }));
  //modelTable.AddComponent(new spatial_grid_controller.SpatialGridController({grid: this._grid}));
  
  modelTable.SetPosition(pos);
  this._entityManager.Add(modelTable);
  modelTable.SetActive(false);
}


  _LoadPlayer() {
    const params = {
      camera: this._camera,
      scene: this._scene,
    };

    // Screw Driver
    const screwdriver = new entity.Entity();
    screwdriver.AddComponent(new inventory_controller.InventoryItem({
        type: 'tools',
        renderParams: {
          name: 'ScrewDriver',
          scale: 0.25,
          icon: 'screw-driver-64.png',
        },
    }));
    this._entityManager.Add(screwdriver);

    // Calculator
    const calculator = new entity.Entity();
    calculator.AddComponent(new inventory_controller.InventoryItem({
        type: 'tools',
        renderParams: {
          name: 'Calculator',
          scale: 0.25,
          icon: 'calculator-64.png',
        },
    }));
    this._entityManager.Add(calculator);

    // Resistor
    const resistor = new entity.Entity();
    resistor.AddComponent(new inventory_controller.InventoryItem({
        type: 'tools',
        renderParams: {
          name: 'Resistor',
          scale: 0.25,
          icon: 'resistor-64.png',
        },
    }));
    this._entityManager.Add(resistor);

    // Battery
    const battery = new entity.Entity();
    battery.AddComponent(new inventory_controller.InventoryItem({
        type: 'tools',
        renderParams: {
          name: 'Battery',
          scale: 0.25,
          icon: 'battery-64.png',
        },
    }));
    this._entityManager.Add(battery);

    // Mouse
    const mouse = new entity.Entity();
    mouse.AddComponent(new inventory_controller.InventoryItem({
        type: 'tools',
        renderParams: {
          name: 'Mouse',
          scale: 0.25,
          icon: 'mouse-64.png',
        },
    }));
    this._entityManager.Add(mouse);

    // USB
    const usb = new entity.Entity();
    usb.AddComponent(new inventory_controller.InventoryItem({
        type: 'tools',
        renderParams: {
          name: 'USB',
          scale: 0.25,
          icon: 'usb-64.png',
        },
    }));
    this._entityManager.Add(usb);

    // CPU
    const cpu = new entity.Entity();
    cpu.AddComponent(new inventory_controller.InventoryItem({
        type: 'tools',
        renderParams: {
          name: 'CPU',
          scale: 0.25,
          icon: 'cpu-64.png',
        },
    }));
    this._entityManager.Add(cpu);

    // Microchip
    const microchip = new entity.Entity();
    microchip.AddComponent(new inventory_controller.InventoryItem({
        type: 'tools',
        renderParams: {
          name: 'Microchip',
          scale: 0.25,
          icon: 'microchip-64.png',
        },
    }));
    this._entityManager.Add(microchip);

    // Processor
    const processor = new entity.Entity();
    processor.AddComponent(new inventory_controller.InventoryItem({
        type: 'tools',
        renderParams: {
          name: 'Processor',
          scale: 0.25,
          icon: 'processor-64.png',
        },
    }));
    this._entityManager.Add(processor);

    // RAM
    const ram = new entity.Entity();
    ram.AddComponent(new inventory_controller.InventoryItem({
        type: 'tools',
        renderParams: {
          name: 'RAM',
          scale: 0.25,
          icon: 'ram-64.png',
        },
    }));
    this._entityManager.Add(ram);

    // Robot
    const Robot = new entity.Entity();
    Robot.AddComponent(new gltf_component.AnimatedModelComponent({
        scene: this._scene,
        resourcePath: './resources/Table/',
        resourceName: 'robotArm.fbx',
        resourceAnimation: 'robotArm.fbx',
        scale: 0.030,
        receiveShadow: true,
        castShadow: true,
    }));
    Robot.AddComponent(new spatial_grid_controller.SpatialGridController({
        grid: this._grid,
    }));
    Robot.AddComponent(new player_input.PickableComponent());
    Robot.AddComponent(new PLCgame_component.PLCComponent());
    Robot.SetPosition(new THREE.Vector3(7, 0, 250));
    this._entityManager.Add(Robot);
    
    // Character: Tom Wanyama
    const Tom = new entity.Entity();
    Tom.AddComponent(new gltf_component.AnimatedModelComponent({
        scene: this._scene,
        resourcePath: './resources/TomWanyama/',
        resourceName: 'Neutral Idle.fbx',
        resourceAnimation: 'Neutral Idle.fbx',
        scale: 0.035,
        receiveShadow: true,
        castShadow: true,
    }));
    Tom.AddComponent(new spatial_grid_controller.SpatialGridController({
        grid: this._grid,
    }));
    Tom.AddComponent(new player_input.PickableComponent());
    Tom.AddComponent(new quest_component.QuestComponent());
    Tom.SetPosition(new THREE.Vector3(30, 0, 0));
    this._entityManager.Add(Tom);

    const player = new entity.Entity();
    player.AddComponent(new player_input.BasicCharacterControllerInput(params));
    player.AddComponent(new player_entity.BasicCharacterController(params));
    player.AddComponent(new inventory_controller.InventoryController(params));
    player.AddComponent(new goose_component.GooseComponent({
        updateUI: true,
        health: 100,
        maxHealth: 100,
    }));
    player.AddComponent(
        new spatial_grid_controller.SpatialGridController({grid: this._grid}));
    this._entityManager.Add(player, 'player');

    player.Broadcast({
        topic: 'inventory.add',
        value: screwdriver.Name,
        added: false,
    });

    player.Broadcast({
        topic: 'inventory.add',
        value: calculator.Name,
        added: false,
    });

    player.Broadcast({
      topic: 'inventory.add',
      value: resistor.Name,
      added: false,
    });

    player.Broadcast({
      topic: 'inventory.add',
      value: battery.Name,
      added: false,
    });

    player.Broadcast({
      topic: 'inventory.add',
      value: mouse.Name,
      added: false,
    });

    player.Broadcast({
      topic: 'inventory.add',
      value: usb.Name,
      added: false,
    });

    player.Broadcast({
      topic: 'inventory.add',
      value: cpu.Name,
      added: false,
    });

    player.Broadcast({
      topic: 'inventory.add',
      value: microchip.Name,
      added: false,
    });

    player.Broadcast({
      topic: 'inventory.add',
      value: processor.Name,
      added: false,
    });

    player.Broadcast({
      topic: 'inventory.add',
      value: ram.Name,
      added: false,
    });

    player.Broadcast({
        topic: 'inventory.equip',
        value: calculator.Name,
        added: false,
    });

    // Add camera onto player
    const camera = new entity.Entity();
    camera.AddComponent(
        new third_person_camera.ThirdPersonCamera({
            camera: this._camera,
            target: this._entityManager.Get('player')}));
    this._entityManager.Add(camera, 'player-camera');

    // Add the famous ETB Goose
    for (let i = 0; i < 1; ++i) {
      const enemyGoose = [
        {
          resourceName: 'MutantGooseIdle.fbx',
          resourceTexture: 'Texture_1.jpg',
        },
      ];
      const m = enemyGoose[math.rand_int(0, enemyGoose.length - 1)];

      const npcGoose = new entity.Entity();
      npcGoose.AddComponent(new npc_entity.NPCController({
          camera: this._camera,
          scene: this._scene,
          resourceName: m.resourceName,
          resourceTexture: m.resourceTexture,
      }));
      npcGoose.AddComponent(
          new spatial_grid_controller.SpatialGridController({grid: this._grid}));
        
      npcGoose.SetPosition(new THREE.Vector3(-90,0,100));
      this._entityManager.Add(npcGoose);
    }
  }

  _OnWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this._threejs.setSize(window.innerWidth, window.innerHeight);
  }

  _UpdateSun() {
    const player = this._entityManager.Get('player');
    const pos = player._position;

    this._sun.position.copy(pos);
    this._sun.position.add(new THREE.Vector3(-10, 500, -10));
    this._sun.target.position.copy(pos);
    this._sun.updateMatrixWorld();
    this._sun.target.updateMatrixWorld();
  }

  _RAF() {
    requestAnimationFrame((t) => {
      if (this._previousRAF === null) {
        this._previousRAF = t;
      }

      this._RAF();

      this._threejs.render(this._scene, this._camera);
      this._Step(t - this._previousRAF);
      this._previousRAF = t;
    });
  }

  _Step(timeElapsed) {
    const timeElapsedS = Math.min(1.0 / 30.0, timeElapsed * 0.001);

    this._UpdateSun();

    this._entityManager.Update(timeElapsedS);
  }
}

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new virtualLearningFactory();
});
