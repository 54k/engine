pc.extend(pc.fw, function () {
    /**
     * @name pc.fw.CollisionMeshComponentSystem
     * @constructor Create a new CollisionMeshComponentSystem
     * @class Manages creation of CollisionMeshComponents
     * @param {pc.fw.ApplicationContext} context The ApplicationContext for the running application
     * @extends pc.fw.ComponentSystem
     */
    var CollisionMeshComponentSystem = function CollisionMeshComponentSystem (context) {
        this.id = "collisionmesh";
        context.systems.add(this.id, this);

        this.ComponentType = pc.fw.CollisionMeshComponent;
        this.DataType = pc.fw.CollisionMeshComponentData;

        this.schema = [{
            name: "asset",
            displayName: "Asset",
            description: "Collision mesh asset",
            type: "asset",
            options: {
                max: 1,
                type: 'model'
            },
            defaultValue: null
        }, {
            name: "shape",
            exposed: false
        }, {
            name: 'model',
            exposed: false
        }];

        this.exposeProperties();

        var format = new pc.gfx.VertexFormat();
        format.begin();
        format.addElement(new pc.gfx.VertexElement("vertex_position", 3, pc.gfx.VertexElementType.FLOAT32));
        format.end();

        var vertexBuffer = new pc.gfx.VertexBuffer(format, 8);
        var positions = new Float32Array(vertexBuffer.lock());
        positions.set([
            -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5,
            -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5
        ]);
        vertexBuffer.unlock();

        var indexBuffer = new pc.gfx.IndexBuffer(pc.gfx.INDEXFORMAT_UINT8, 24);
        var indices = new Uint8Array(indexBuffer.lock());
        indices.set([
            0,1,1,2,2,3,3,0,
            4,5,5,6,6,7,7,4,
            0,4,1,5,2,6,3,7
        ]);
        indexBuffer.unlock();

        this.mesh = new pc.scene.Mesh();
        this.mesh.vertexBuffer = vertexBuffer;
        this.mesh.indexBuffer[0] = indexBuffer;
        this.mesh.primitive[0].type = pc.gfx.PRIMITIVE_LINES;
        this.mesh.primitive[0].base = 0;
        this.mesh.primitive[0].count = indexBuffer.getNumIndices();
        this.mesh.primitive[0].indexed = true;

        this.material = new pc.scene.BasicMaterial();
        this.material.color = pc.math.vec4.create(0, 0, 1, 1);
        this.material.update();

        this.debugRender = false;

        this.on('remove', this.onRemove, this);

        pc.fw.ComponentSystem.on('update', this.onUpdate, this);
        pc.fw.ComponentSystem.on('toolsUpdate', this.onToolsUpdate, this);
          
    };
    CollisionMeshComponentSystem = pc.inherits(CollisionMeshComponentSystem, pc.fw.ComponentSystem);
    
    CollisionMeshComponentSystem.prototype = pc.extend(CollisionMeshComponentSystem.prototype, {
        initializeComponentData: function (component, data, properties) {
            properties = ['asset'];
            CollisionMeshComponentSystem._super.initializeComponentData.call(this, component, data, properties);
        },

        cloneComponent: function (entity, clone) {
            var component = this.addComponent(clone, {});

            clone.collisionmesh.data.asset = entity.model.asset;
            clone.collisionmesh.model = entity.model.model.clone();
        },
        
        onRemove: function (entity, data) {
            if (entity.rigidbody && entity.rigidbody.body) {
                this.context.systems.rigidbody.removeBody(entity.rigidbody.body);
            }
/*
            if (this.context.scene.containsModel(data.model)) {
                this.context.root.removeChild(data.model.graph);
                this.context.scene.removeModel(data.model);
            }*/
        },

        /**
        * @function
        * @name pc.fw.CollisionMeshComponentSystem#setDebugRender
        * @description Display collision shape outlines
        * @param {Boolean} value Enable or disable
        */
        setDebugRender: function (value) {
            this.debugRender = value;
        },

        onUpdate: function (dt) {
            if (this.debugRender) {
  //              this.updateDebugShapes();
            }
        },

        onToolsUpdate: function (dt) {
//            this.updateDebugShapes();
        },

        updateDebugShapes: function () {
            /*
            var components = this.store;
            for (id in components) {
                var entity = components[id].entity;
                var data = components[id].data;

                var x = data.halfExtents[0];
                var y = data.halfExtents[1];
                var z = data.halfExtents[2];
                var model = data.model;

                if (!this.context.scene.containsModel(data.model)) {
                    this.context.scene.addModel(data.model);
                    this.context.root.addChild(data.model.graph);
                }

                var root = model.graph;
                root.setPosition(entity.getPosition());
                root.setRotation(entity.getRotation());
                root.setLocalScale(x / 0.5, y / 0.5, z / 0.5);
            }*/
        }
    });

    return {
        CollisionMeshComponentSystem: CollisionMeshComponentSystem
    };
}());